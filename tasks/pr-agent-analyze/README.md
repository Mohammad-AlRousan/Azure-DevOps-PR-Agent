# PR Agent Analyze Task

## Overview

The **PR Agent Analyze** task brings AI-powered code analysis directly to your Azure DevOps pipelines. This task performs comprehensive analysis of your code changes including code review, security scanning, compliance checks, and quality assessment.

## Features

- 🔍 **AI Code Review**: Intelligent analysis of code quality and best practices
- 🚀 **Improvement Suggestions**: AI-generated recommendations for optimization
- 🧪 **Test Generation**: Automated test case suggestions
- 📋 **Compliance Checking**: Validation against coding standards and policies
- 🔒 **Security Scanning**: Detection of vulnerabilities and sensitive data exposure
- ✅ **Auto-Approval Assessment**: Risk-based approval recommendations

## Usage

### Basic Usage

```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'AI Code Review'
  inputs:
    analysisType: 'review'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(PR_AGENT_API_KEY)'
```

### Azure OpenAI Usage

```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'AI Code Review with Azure OpenAI'
  inputs:
    analysisType: 'review'
    apiEndpoint: 'https://your-resource.openai.azure.com/'
    apiKey: '$(AZURE_OPENAI_API_KEY)'
    deploymentName: 'gpt-4.1'
    apiVersion: '2024-02-15-preview'
```

### Advanced Usage

```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Comprehensive AI Analysis'
  inputs:
    analysisType: 'review'
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
```

## Parameters

### Required Parameters

| Parameter | Description |
|-----------|-------------|
| `analysisType` | Type of analysis to perform (`review`, `improve`, `tests`, `compliance`, `security`, `auto-approve`) |
| `apiEndpoint` | URL of your PR Agent API endpoint OR Azure OpenAI endpoint |
| `apiKey` | API key for authentication (use secret variables) |
| `prUrl` | Specific PR URL to analyze (optional - auto-detects if not provided) |

### Optional Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `sourceDirectory` | `$(Build.SourcesDirectory)` | Directory containing source code to analyze |
| `includePatterns` | (all files) | File patterns to include (one per line) |
| `excludePatterns` | (none) | File patterns to exclude (one per line) |
| `enableSecurityScan` | `true` | Include security vulnerability detection |
| `enableComplianceCheck` | `true` | Include coding standards validation |
| `qualityThreshold` | `80` | Minimum quality score (0-100) |
| `securityThreshold` | `90` | Minimum security score (0-100) |
| `outputFormat` | `json` | Output format (`json`, `markdown`, `junit`, `sarif`) |
| `outputFile` | (none) | Path to save analysis results |
| `publishResults` | `true` | Publish results as test results |
| `createWorkItems` | `false` | Create work items for critical issues |
| `timeout` | `10` | Analysis timeout in minutes |
| `retryCount` | `3` | Number of retry attempts |
| `customPrompt` | (none) | Custom instructions for AI analysis |
| `enableTelemetry` | `true` | Allow anonymous usage telemetry |
| `deploymentName` | `gpt-4.1` | Azure OpenAI deployment name |
| `apiVersion` | `2024-02-15-preview` | Azure OpenAI API version |
| `prUrl` | (auto-detect) | Specific PR URL to analyze |

## 🔧 Configuration Options

### **Required Configuration**
Set these pipeline variables in Azure DevOps:

```yaml
variables:
  # Azure OpenAI Configuration
  AZURE_OPENAI_ENDPOINT: 'https://1labaidemo01.openai.azure.com/'
  AZURE_OPENAI_API_KEY: 'your-api-key'  # Mark as SECRET

  # Extension Security (Required)
  EXTENSION_KEY: 'XXXXXXX' # Contact us to get it

  # Optional: Override defaults if needed
  AZURE_OPENAI_DEPLOYMENT_NAME: 'gpt-4.1'  # Default
  AZURE_OPENAI_API_VERSION: '2024-02-15-preview'  # Default
```

### **Default Settings (Optimized for Your Setup)**
- **Deployment Name**: `gpt-4.1` (your Azure OpenAI deployment)
- **API Version**: `2024-02-15-preview`
- **Quality Threshold**: 80%
- **Security Threshold**: 90%
- **Output Format**: JSON
- **Retry Count**: 3 attempts

### **Basic Pipeline Usage**
```yaml
steps:
- task: DevOpsPRAgentAnalyze@1
  displayName: 'AI Code Review'
  inputs:
    analysisType: 'review'
    apiEndpoint: '$(AZURE_OPENAI_ENDPOINT)'
    apiKey: '$(AZURE_OPENAI_API_KEY)'
    # All other parameters use optimized defaults
```

### **Advanced Pipeline Usage**
```yaml
steps:
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Comprehensive AI Analysis'
  inputs:
    analysisType: 'security'
    apiEndpoint: '$(AZURE_OPENAI_ENDPOINT)'
    apiKey: '$(AZURE_OPENAI_API_KEY)'
    deploymentName: '$(AZURE_OPENAI_DEPLOYMENT_NAME)'
    apiVersion: '$(AZURE_OPENAI_API_VERSION)'
    qualityThreshold: 85
    securityThreshold: 95
    outputFormat: 'junit'
    publishResults: true
```

### **Manual PR Analysis**
```yaml
steps:
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Analyze Specific PR'
  inputs:
    analysisType: 'review'
    apiEndpoint: '$(AZURE_OPENAI_ENDPOINT)'
    apiKey: '$(AZURE_OPENAI_API_KEY)'
    prUrl: 'https://dev.azure.com/myorg/myproject/_git/myrepo/pullrequest/123'
    # Will analyze and comment on the specified PR
```

## Output

The task produces several types of output:

### Console Output
- Analysis summary with quality and security scores
- Key issues and suggestions
- Execution status and timing

### File Output
Depending on the `outputFormat` parameter:
- **JSON**: Structured analysis results
- **Markdown**: Human-readable report
- **JUnit XML**: Test results format for Azure DevOps
- **SARIF**: Security analysis results format

### Azure DevOps Integration
- Test results published to pipeline (when `publishResults` is true)
- Work items created for critical issues (when `createWorkItems` is true)
- Pipeline variables set with analysis results

## Examples

### Security-Focused Analysis

```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Security Scan'
  inputs:
    analysisType: 'security'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(PR_AGENT_API_KEY)'
    enableSecurityScan: true
    securityThreshold: 95
    outputFormat: 'sarif'
    outputFile: '$(Agent.TempDirectory)/security-results.sarif'
```

### Quality Gate

```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Quality Gate'
  inputs:
    analysisType: 'review'
    apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
    apiKey: '$(PR_AGENT_API_KEY)'
    qualityThreshold: 90
    securityThreshold: 95
  continueOnError: false
```

### Multi-Stage Analysis

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
        
  - job: ComplianceCheck
    displayName: 'Compliance Check'
    steps:
    - task: DevOpsPRAgentAnalyze@1
      inputs:
        analysisType: 'compliance'
        apiEndpoint: '$(PR_AGENT_API_ENDPOINT)'
        apiKey: '$(PR_AGENT_API_KEY)'
```

## Error Handling

The task will fail if:
- API endpoint is unreachable
- Authentication fails
- Quality score is below threshold
- Security score is below threshold
- Analysis times out
- Critical security vulnerabilities are found

## Best Practices

1. **Use Secret Variables**: Always store API keys in Azure DevOps secret variables
2. **Set Appropriate Thresholds**: Configure quality and security thresholds based on your standards
3. **Filter Files**: Use include/exclude patterns to focus analysis on relevant code
4. **Parallel Execution**: Run different analysis types in parallel for faster feedback
5. **Conditional Execution**: Use conditions to run analysis only on specific branches or changes

## Troubleshooting

### Common Issues

**Task fails with "API endpoint unreachable"**
- Verify the API endpoint URL is correct
- Check network connectivity from build agents
- Ensure firewall rules allow outbound connections

**Authentication errors**
- Verify API key is correct and not expired
- Check that the secret variable is properly configured
- Ensure the API key has necessary permissions

**Analysis timeout**
- Increase the timeout value for large codebases
- Consider filtering files to reduce analysis scope
- Check API endpoint performance

**Low quality/security scores**
- Review the detailed analysis results
- Address critical issues identified by the AI
- Consider adjusting thresholds if they're too strict

## Support

### **Developer**
- 👨‍💻 **Author**: Mohammad Al Rousan
- 🐙 **GitHub**: [https://github.com/Mohammad-AlRousan](https://github.com/Mohammad-AlRousan)

### **Resources**
- 📖 **Documentation**: Complete usage guides and examples
- 🚀 **Get Started**: [Installation Guide](https://marketplace.visualstudio.com/items?itemName=DevOps-PR-Review.azdo-pr-agent)
- 📋 **Support**: [GitHub Issues](https://github.com/Mohammad-AlRousan)
- 💬 **Community**: [GitHub Discussions](https://github.com/Mohammad-AlRousan)
