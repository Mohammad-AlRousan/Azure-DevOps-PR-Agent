# 🚀 Azure DevOps Pipeline Task - Usage Guide

This guide explains how to use the PR Agent pipeline task in your Azure DevOps pipelines.

---

## 📦 Installation

Install the extension from the [Azure DevOps Marketplace](https://marketplace.visualstudio.com/items?itemName=DevOps-PR-Review.azdo-pr-agent).

---

## 🔧 How to Use the Pipeline Task

### **Add Task to Pipeline**

#### **YAML Pipeline:**
```yaml
# Basic usage
- task: DevOpsPRAgentAnalyze@1
  displayName: 'AI Code Review'
  inputs:
    analysisType: 'review'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(PR_AGENT_API_KEY)'

# Advanced usage with all options
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Comprehensive AI Analysis'
  inputs:
    analysisType: 'security'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(PR_AGENT_API_KEY)'
    sourceDirectory: '$(Build.SourcesDirectory)'
    includePatterns: |
      src/**/*.js
      src/**/*.ts
      *.py
    excludePatterns: |
      node_modules/**
      dist/**
      *.test.js
    enableSecurityScan: true
    enableComplianceCheck: true
    qualityThreshold: 85
    securityThreshold: 95
    outputFormat: 'junit'
    outputFile: '$(Agent.TempDirectory)/pr-agent-results.xml'
    publishResults: true
    createWorkItems: false
    timeout: 15
    retryCount: 3
```

#### **Classic Pipeline:**
1. Click "+" to add a task
2. Search for "DevOps PR Agent Analyze"
3. Configure the required parameters:
   - **Analysis Type**: Choose from dropdown
   - **API Endpoint**: Your PR Agent API URL
   - **API Key**: Use a secret variable

### **Configure Variables**

Set up these pipeline variables (mark API key as secret):

```yaml
variables:
  PR_AGENT_API_ENDPOINT: 'https://your-pr-agent-api.com'
  PR_AGENT_API_KEY: 'your-secret-api-key'  # Mark as secret!
```

### **Analysis Types Available**

| Type | Description | Use Case |
|------|-------------|----------|
| `review` | AI code review | General code quality analysis |
| `improve` | Improvement suggestions | Optimization recommendations |
| `tests` | Test generation | Automated test case suggestions |
| `compliance` | Compliance check | Standards validation |
| `security` | Security scan | Vulnerability detection |
| `auto-approve` | Auto-approval assessment | Risk-based approval decisions |

## 🎯 **Common Pipeline Scenarios**

### **Scenario 1: Quality Gate**
```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Quality Gate Check'
  inputs:
    analysisType: 'review'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(PR_AGENT_API_KEY)'
    qualityThreshold: 90
    securityThreshold: 95
  continueOnError: false  # Fail pipeline if thresholds not met
```

### **Scenario 2: Security-First Pipeline**
```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Security Scan'
  inputs:
    analysisType: 'security'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(PR_AGENT_API_KEY)'
    enableSecurityScan: true
    securityThreshold: 98
    outputFormat: 'sarif'
    outputFile: '$(Agent.TempDirectory)/security-results.sarif'
```

### **Scenario 3: Multi-Stage Analysis**
```yaml
stages:
- stage: CodeAnalysis
  displayName: 'AI Code Analysis'
  jobs:
  - job: SecurityScan
    displayName: 'Security Analysis'
    steps:
    - task: DevOpsPRAgentAnalyze@1
      inputs:
        analysisType: 'security'
        apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
        apiKey: '$(PR_AGENT_API_KEY)'
        
  - job: QualityReview
    displayName: 'Quality Review'
    steps:
    - task: DevOpsPRAgentAnalyze@1
      inputs:
        analysisType: 'review'
        apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
        apiKey: '$(PR_AGENT_API_KEY)'
```

### **Scenario 4: Conditional Analysis**
```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'AI Analysis (Main Branch Only)'
  condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
  inputs:
    analysisType: 'review'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(PR_AGENT_API_KEY)'
```

## 📊 **Output and Results**

### **Console Output**
The task provides detailed console output including:
- Analysis summary with scores
- Key issues found
- Execution timing
- Threshold validation results

### **File Output**
Supports multiple output formats:
- **JSON**: Structured data for further processing
- **Markdown**: Human-readable reports
- **JUnit XML**: Integration with Azure DevOps test results
- **SARIF**: Security analysis results format

### **Azure DevOps Integration**
- **Test Results**: Published automatically when `publishResults: true`
- **Work Items**: Created for critical issues when `createWorkItems: true`
- **Pipeline Variables**: Analysis results available as pipeline variables

## 🔍 **Finding the Task**

After installation, you can find the task:

### **In YAML Editor:**
- Type `DevOpsPRAgentAnalyze@1`
- IntelliSense will show available parameters

### **In Classic Editor:**
- **Category**: Utility
- **Search**: "DevOps PR Agent" or "AI Analysis"
- **Display Name**: "DevOps PR Agent Analyze"

### **In Task Assistant:**
- Search for "PR Agent", "AI", or "DevOps"
- Look for the robot emoji 🤖

## ⚙️ **Configuration Best Practices**

### **1. Security**
- Always use secret variables for API keys
- Restrict API endpoint access to build agents
- Use least-privilege API keys

### **2. Performance**
- Use file patterns to limit analysis scope
- Set appropriate timeouts for large codebases
- Consider parallel execution for different analysis types

### **3. Quality Gates**
- Set realistic quality and security thresholds
- Use `continueOnError: false` for strict quality gates
- Implement gradual threshold increases

### **4. Monitoring**
- Enable telemetry for usage insights
- Monitor task execution times
- Track quality trends over time

## 🚨 **Troubleshooting**

### **Task Not Found**
- Verify extension is installed in your organization
- Check that you have the correct task name: `DevOpsPRAgentAnalyze@1`
- Ensure you have permissions to use the extension

### **Authentication Errors**
- Verify API endpoint is accessible from build agents
- Check API key is correct and not expired
- Ensure secret variable is properly configured

### **Analysis Failures**
- Check API endpoint health and performance
- Verify file patterns are not too restrictive
- Increase timeout for large codebases
- Review API rate limits

## 📈 **Success Metrics**

Track these metrics to measure success:
- **Quality Score Trends**: Monitor improvement over time
- **Security Score Trends**: Track vulnerability reduction
- **Issue Detection Rate**: Measure AI effectiveness
- **Pipeline Success Rate**: Monitor threshold compliance
- **Time to Feedback**: Measure analysis speed

---

*For more information, see the main [README](../README.md).*
