# Azure DevOps PR Agent

🤖 **AI-powered code analysis and review for Azure DevOps pull requests**

Transform your code review process with intelligent AI analysis that provides comprehensive feedback on code quality, security, performance, and best practices.

## 🚀 Quick Start

### Installation

1. **Install from Azure DevOps Marketplace**
   - Search for "Azure DevOps PR Agent" in the marketplace
   - Click "Get it free" and install to your organization

2. **Add to Your Pipeline**
   ```yaml
   - task: DevOpsPRAgentAnalyze@1
     inputs:
       analysisType: 'review'
     env:
       AZURE_OPENAI_ENDPOINT: $(openai-endpoint)
       AZURE_OPENAI_API_KEY: $(openai-key)
       AZURE_DEVOPS_PAT: $(System.AccessToken)
   ```

3. **Run Your Pipeline**
   - The task will automatically analyze your pull request
   - AI-generated comments will appear on your PR

## 📊 Analysis Types

### **review** - Code Quality Analysis
Comprehensive code review focusing on:
- Code maintainability and readability
- Best practices adherence
- Function and variable naming
- Code structure and organization

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'review'
```

### **security** - Security Analysis
Security-focused analysis including:
- Vulnerability detection
- Input validation checks
- Authentication and authorization review
- Sensitive data handling

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'security'
```

### **improve** - Performance & Optimization
Performance and improvement suggestions:
- Code optimization opportunities
- Performance bottleneck identification
- Resource usage optimization
- Algorithm efficiency improvements

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'improve'
```

### **compliance** - Standards & Documentation
Compliance and documentation analysis:
- Coding standards adherence
- Documentation completeness
- Comment quality and coverage
- API documentation review

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'compliance'
```

### **tests** - Test Coverage & Quality
Testing analysis and suggestions:
- Test coverage assessment
- Test quality evaluation
- Missing test scenarios identification
- Test best practices review

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'tests'
```

### **auto-approve** - Risk Assessment
Automated approval risk evaluation:
- Change complexity assessment
- Risk level determination
- Auto-approval eligibility
- Safety checks for automated workflows

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'auto-approve'
```

### **all** - Comprehensive Analysis
Runs all analysis types and posts separate comments:
- Executes all 6 analysis types
- Posts individual comments for each type
- Provides comprehensive coverage
- Ideal for thorough code review

```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'all'
```

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI service endpoint | `https://your-openai.openai.azure.com/` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | `$(openai-api-key)` |
| `AZURE_DEVOPS_PAT` | Azure DevOps Personal Access Token | `$(System.AccessToken)` |

### Optional Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `qualityThreshold` | 75 | Minimum quality score (0-100) |
| `securityThreshold` | 80 | Minimum security score (0-100) |
| `outputFormat` | markdown | Output format (markdown, json, junit) |
| `publishResults` | false | Publish results to Azure DevOps |
| `deploymentName` | gpt-4 | Azure OpenAI deployment name |
| `apiVersion` | 2024-02-15-preview | Azure OpenAI API version |
| `timeout` | 300000 | Request timeout in milliseconds |

## 📝 Complete Examples

### Basic Code Review
```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- checkout: self
  persistCredentials: true

- task: DevOpsPRAgentAnalyze@1
  displayName: 'AI Code Review'
  inputs:
    analysisType: 'review'
    qualityThreshold: 80
  env:
    AZURE_OPENAI_ENDPOINT: 'https://mycompany-openai.openai.azure.com/'
    AZURE_OPENAI_API_KEY: $(OPENAI_API_KEY)
    AZURE_DEVOPS_PAT: $(System.AccessToken)
```

### Security-Focused Analysis
```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Security Analysis'
  inputs:
    analysisType: 'security'
    securityThreshold: 90
    outputFormat: 'markdown'
  env:
    AZURE_OPENAI_ENDPOINT: $(AZURE_OPENAI_ENDPOINT)
    AZURE_OPENAI_API_KEY: $(AZURE_OPENAI_API_KEY)
    AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT)
```

### Comprehensive Analysis with Custom Settings
```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Comprehensive AI Analysis'
  inputs:
    analysisType: 'all'
    qualityThreshold: 85
    securityThreshold: 90
    publishResults: true
    deploymentName: 'gpt-4-turbo'
    timeout: 600000
  env:
    AZURE_OPENAI_ENDPOINT: $(AZURE_OPENAI_ENDPOINT)
    AZURE_OPENAI_API_KEY: $(AZURE_OPENAI_API_KEY)
    AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT)
```

### Multi-Stage Pipeline with Different Analysis Types
```yaml
stages:
- stage: CodeQuality
  displayName: 'Code Quality Analysis'
  jobs:
  - job: Review
    steps:
    - task: DevOpsPRAgentAnalyze@1
      inputs:
        analysisType: 'review'

- stage: Security
  displayName: 'Security Analysis'
  jobs:
  - job: SecurityScan
    steps:
    - task: DevOpsPRAgentAnalyze@1
      inputs:
        analysisType: 'security'
        securityThreshold: 95

- stage: Performance
  displayName: 'Performance Analysis'
  jobs:
  - job: Optimization
    steps:
    - task: DevOpsPRAgentAnalyze@1
      inputs:
        analysisType: 'improve'
```

## 🔧 Advanced Configuration

### Using Variable Groups
```yaml
variables:
- group: 'OpenAI-Configuration'  # Contains AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY
- group: 'DevOps-Tokens'        # Contains AZURE_DEVOPS_PAT

steps:
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'all'
  env:
    AZURE_OPENAI_ENDPOINT: $(AZURE_OPENAI_ENDPOINT)
    AZURE_OPENAI_API_KEY: $(AZURE_OPENAI_API_KEY)
    AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT)
```

### Conditional Analysis Based on File Changes
```yaml
- task: DevOpsPRAgentAnalyze@1
  displayName: 'Security Analysis for Backend Changes'
  condition: contains(variables['Build.SourceBranch'], 'feature/')
  inputs:
    analysisType: 'security'
  env:
    AZURE_OPENAI_ENDPOINT: $(AZURE_OPENAI_ENDPOINT)
    AZURE_OPENAI_API_KEY: $(AZURE_OPENAI_API_KEY)
    AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT)
```

### Custom Deployment and API Settings
```yaml
- task: DevOpsPRAgentAnalyze@1
  inputs:
    analysisType: 'review'
    deploymentName: 'gpt-4-32k'
    apiVersion: '2024-02-15-preview'
    timeout: 900000  # 15 minutes
  env:
    AZURE_OPENAI_ENDPOINT: $(AZURE_OPENAI_ENDPOINT)
    AZURE_OPENAI_API_KEY: $(AZURE_OPENAI_API_KEY)
    AZURE_DEVOPS_PAT: $(AZURE_DEVOPS_PAT)
```

## 🔑 Setup Guide

### 1. Azure OpenAI Service Setup

**Create Azure OpenAI Resource:**
1. Go to Azure Portal → Create Resource → Azure OpenAI
2. Choose subscription, resource group, and region
3. Create the resource and note the endpoint URL

**Deploy GPT Model:**
1. Go to Azure OpenAI Studio
2. Navigate to Deployments → Create new deployment
3. Select GPT-4 or GPT-3.5-turbo model
4. Note the deployment name (e.g., "gpt-4")

**Get API Key:**
1. Go to Azure OpenAI resource → Keys and Endpoint
2. Copy Key 1 or Key 2
3. Store securely in Azure DevOps variable groups

### 2. Azure DevOps Configuration

**Create Variable Groups:**
```yaml
# In Azure DevOps → Pipelines → Library → Variable groups
OpenAI-Configuration:
  AZURE_OPENAI_ENDPOINT: 'https://your-openai.openai.azure.com/'
  AZURE_OPENAI_API_KEY: 'your-api-key-here'  # Mark as SECRET

DevOps-Tokens:
  AZURE_DEVOPS_PAT: 'your-pat-token'  # Mark as SECRET
```

**Set Repository Permissions:**
1. Go to Project → Repos → [Repository] → Security
2. Find "{Project} Build Service ({Organization})" account
3. Set "Contribute to pull requests" to **Allow**

## 🚨 Troubleshooting

### Common Issues

**Issue: "No Azure DevOps authentication token available"**
- Ensure AZURE_DEVOPS_PAT is set in pipeline variables
- Verify the PAT has correct permissions
- Check variable group is linked to pipeline

**Issue: "TF401027: You need the Git 'PullRequestContribute' permission"**
- Go to Project → Repos → [Repository] → Security
- Find build service account
- Set "Contribute to pull requests" to Allow

**Issue: "Azure OpenAI API request failed"**
- Verify AZURE_OPENAI_ENDPOINT is correct
- Check AZURE_OPENAI_API_KEY is valid
- Ensure deployment name matches your Azure OpenAI deployment

## 📄 License

MIT License - see LICENSE file for details.

---

*For more information, see the main [README](../README.md).*
