#!/bin/bash

# Test Runner Script for Multi-Agent System

echo "🚀 Multi-Agent System Test Suite"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Not in project root directory${NC}"
    exit 1
fi

# Function to run tests
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "\n${YELLOW}Running: $test_name${NC}"
    echo "----------------------------------------"
    
    if eval $test_command; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        return 1
    fi
}

# Track test results
FAILED_TESTS=0

# Run Frontend Tests
echo -e "\n${YELLOW}Frontend Tests${NC}"
echo "=============="

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Run unit tests
run_test "Unit Tests" "npm run test:unit -- --watchAll=false"
FAILED_TESTS=$((FAILED_TESTS + $?))

# Run integration tests (only if not in CI)
if [ -z "$CI" ]; then
    run_test "Integration Tests" "npm run test:integration -- --watchAll=false"
    FAILED_TESTS=$((FAILED_TESTS + $?))
else
    echo -e "${YELLOW}Skipping integration tests in CI environment${NC}"
fi

# Run coverage report
run_test "Coverage Report" "npm run test:coverage"
FAILED_TESTS=$((FAILED_TESTS + $?))

cd ..

# Validate JSON Schemas
echo -e "\n${YELLOW}Schema Validation${NC}"
echo "================="

# Check if ajv-cli is installed
if ! command -v ajv &> /dev/null; then
    echo "Installing ajv-cli for schema validation..."
    npm install -g ajv-cli
fi

# Validate schemas
run_test "Scoping Session Schema" "ajv compile -s schemas/scoping-session-output.json"
FAILED_TESTS=$((FAILED_TESTS + $?))

run_test "Validation Report Schema" "ajv compile -s schemas/validation-report.json"
FAILED_TESTS=$((FAILED_TESTS + $?))

# Check n8n Workflow Files
echo -e "\n${YELLOW}n8n Workflow Validation${NC}"
echo "======================"

for workflow in n8n-workflows/*/*.json; do
    if [ -f "$workflow" ]; then
        run_test "Validate $(basename $workflow)" "python3 -m json.tool $workflow > /dev/null"
        FAILED_TESTS=$((FAILED_TESTS + $?))
    fi
done

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ $FAILED_TESTS test(s) failed${NC}"
    exit 1
fi
