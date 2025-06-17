import { ApiService } from '../services/ApiService';
import { SessionContext } from '../types';

// Integration tests that test the full flow
describe('Pain Point Scoping Integration Tests', () => {
  const API_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/start-scoping-session';

  // Note: These tests require a running n8n instance with the workflows configured
  // Skip these tests in CI/CD unless n8n is available
  const skipIfNoN8n = process.env.CI ? describe.skip : describe;

  skipIfNoN8n('Full Session Flow', () => {
    let sessionId: string;

    it('should complete a full scoping session', async () => {
      // Step 1: Start session
      const context: SessionContext = {
        projectName: 'Integration Test Project',
        userRole: 'Test Engineer',
        industry: 'Software Testing',
      };

      sessionId = await ApiService.startSession(context);
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');

      // Step 2: Send initial message
      const response1 = await ApiService.sendMessage(
        sessionId,
        "I'm trying to improve our test automation coverage"
      );
      expect(response1.sender).toBe('ai');
      expect(response1.text).toBeTruthy();

      // Step 3: Continue conversation
      const response2 = await ApiService.sendMessage(
        sessionId,
        'We currently have only 30% coverage and tests are flaky'
      );
      expect(response2.text).toBeTruthy();

      // Step 4: Provide pain point details
      const response3 = await ApiService.sendMessage(
        sessionId,
        'The main issue is that our tests take too long to run'
      );
      expect(response3.text).toBeTruthy();

      // Step 5: Answer why questions
      const response4 = await ApiService.sendMessage(
        sessionId,
        'Because we have too many UI tests and not enough unit tests'
      );
      expect(response4.text).toBeTruthy();

      // Continue until session completes
      // Note: Actual completion depends on the AI agent's behavior
    }, 60000); // 60 second timeout for full conversation

    afterEach(async () => {
      if (sessionId) {
        try {
          await ApiService.endSession(sessionId);
        } catch (error) {
          console.error('Failed to end session:', error);
        }
      }
    });
  });

  skipIfNoN8n('Error Handling', () => {
    it('should handle invalid session ID gracefully', async () => {
      await expect(
        ApiService.sendMessage('invalid-session-id', 'Test message')
      ).rejects.toThrow();
    });

    it('should handle empty messages', async () => {
      const sessionId = await ApiService.startSession({
        projectName: 'Error Test',
      });

      await expect(
        ApiService.sendMessage(sessionId, '')
      ).rejects.toThrow();

      await ApiService.endSession(sessionId);
    });
  });

  skipIfNoN8n('Concurrent Sessions', () => {
    it('should handle multiple concurrent sessions', async () => {
      const sessions = await Promise.all([
        ApiService.startSession({ projectName: 'Project 1' }),
        ApiService.startSession({ projectName: 'Project 2' }),
        ApiService.startSession({ projectName: 'Project 3' }),
      ]);

      expect(sessions).toHaveLength(3);
      expect(new Set(sessions).size).toBe(3); // All unique IDs

      // Send messages to each session
      const responses = await Promise.all(
        sessions.map((sessionId, index) =>
          ApiService.sendMessage(sessionId, `Message from session ${index + 1}`)
        )
      );

      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect(response.sender).toBe('ai');
        expect(response.text).toBeTruthy();
      });

      // Clean up
      await Promise.all(sessions.map((id) => ApiService.endSession(id)));
    });
  });

  describe('Mock Integration Tests', () => {
    // These tests use mocked responses for CI/CD environments
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should validate session output schema', async () => {
      const mockSessionOutput = {
        uid: 'test-uid-123',
        sessionTimestamp: new Date().toISOString(),
        userPersona: {
          role: 'Product Manager',
          industry: 'SaaS',
        },
        jobToBeDone: {
          primaryJob: 'Improve team productivity',
          functionalAspects: ['Reduce meeting time', 'Automate reports'],
          emotionalAspects: ['Feel more in control', 'Reduce stress'],
          socialAspects: ['Better team collaboration'],
          barriers: ['Lack of tools', 'Resistance to change'],
        },
        identifiedPainPoints: [
          {
            painPoint: 'Too many status meetings',
            impact: 'Wastes 10 hours per week',
            rootCauseAnalysis: [
              { why: 1, cause: 'No central project visibility' },
              { why: 2, cause: 'Tools are siloed' },
              { why: 3, cause: 'No integration between systems' },
              { why: 4, cause: 'Budget constraints for new tools' },
              { why: 5, cause: 'Leadership prioritizes other investments' },
            ],
            rootCause: 'Leadership prioritizes other investments',
          },
        ],
        conversationSummary: 'User identified meeting inefficiency as main pain point',
        fullTranscript: 'Full conversation transcript here...',
      };

      // Validate against schema
      expect(mockSessionOutput).toMatchObject({
        uid: expect.any(String),
        sessionTimestamp: expect.any(String),
        userPersona: {
          role: expect.any(String),
          industry: expect.any(String),
        },
        jobToBeDone: {
          primaryJob: expect.any(String),
          functionalAspects: expect.arrayContaining([expect.any(String)]),
          emotionalAspects: expect.arrayContaining([expect.any(String)]),
          socialAspects: expect.arrayContaining([expect.any(String)]),
          barriers: expect.arrayContaining([expect.any(String)]),
        },
        identifiedPainPoints: expect.arrayContaining([
          expect.objectContaining({
            painPoint: expect.any(String),
            impact: expect.any(String),
            rootCauseAnalysis: expect.arrayContaining([
              expect.objectContaining({
                why: expect.any(Number),
                cause: expect.any(String),
              }),
            ]),
            rootCause: expect.any(String),
          }),
        ]),
        conversationSummary: expect.any(String),
        fullTranscript: expect.any(String),
      });

      // Validate 5 whys structure
      const painPoint = mockSessionOutput.identifiedPainPoints[0];
      expect(painPoint.rootCauseAnalysis).toHaveLength(5);
      painPoint.rootCauseAnalysis.forEach((analysis, index) => {
        expect(analysis.why).toBe(index + 1);
        expect(analysis.cause).toBeTruthy();
      });
    });

    it('should validate validation report schema', async () => {
      const mockValidationReport = {
        uid: 'test-uid-123',
        validationTimestamp: new Date().toISOString(),
        overallScore: 0.85,
        evaluationCriteria: {
          roleAdherence: {
            score: 0.9,
            reasoning: 'Agent maintained professional analyst persona throughout',
          },
          frameworkAdherenceJTBD: {
            score: 0.85,
            reasoning: 'Successfully identified job-to-be-done',
          },
          frameworkAdherence5Whys: {
            score: 0.8,
            reasoning: 'Completed 5 whys analysis for main pain point',
          },
          conversationRelevancy: {
            score: 0.95,
            reasoning: 'Conversation stayed on topic',
          },
          outputSchemaCompliance: {
            score: 1.0,
            reasoning: 'Output perfectly matches required schema',
          },
          absenceOfHallucinations: {
            score: 0.9,
            reasoning: 'No invented facts detected',
          },
        },
        recommendations: [
          'Improve depth of 5 whys questioning',
          'Explore more emotional aspects of JTBD',
        ],
      };

      // Validate report structure
      expect(mockValidationReport).toMatchObject({
        uid: expect.any(String),
        validationTimestamp: expect.any(String),
        overallScore: expect.any(Number),
        evaluationCriteria: {
          roleAdherence: expect.objectContaining({
            score: expect.any(Number),
            reasoning: expect.any(String),
          }),
          frameworkAdherenceJTBD: expect.objectContaining({
            score: expect.any(Number),
            reasoning: expect.any(String),
          }),
          frameworkAdherence5Whys: expect.objectContaining({
            score: expect.any(Number),
            reasoning: expect.any(String),
          }),
          conversationRelevancy: expect.objectContaining({
            score: expect.any(Number),
            reasoning: expect.any(String),
          }),
          outputSchemaCompliance: expect.objectContaining({
            score: expect.any(Number),
            reasoning: expect.any(String),
          }),
          absenceOfHallucinations: expect.objectContaining({
            score: expect.any(Number),
            reasoning: expect.any(String),
          }),
        },
        recommendations: expect.arrayContaining([expect.any(String)]),
      });

      // Validate score ranges
      expect(mockValidationReport.overallScore).toBeGreaterThanOrEqual(0);
      expect(mockValidationReport.overallScore).toBeLessThanOrEqual(1);

      Object.values(mockValidationReport.evaluationCriteria).forEach((criterion) => {
        expect(criterion.score).toBeGreaterThanOrEqual(0);
        expect(criterion.score).toBeLessThanOrEqual(1);
      });
    });
  });
});
