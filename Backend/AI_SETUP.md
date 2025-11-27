# AI Assistant Setup Guide

## Azure OpenAI Configuration

The AI Assistant uses Azure OpenAI Service. You need to configure the following environment variables:

### Required Environment Variables

Add these to your `application.properties` or as environment variables:

```properties
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
```

### How to Get Azure OpenAI Credentials

1. **Create an Azure Account**
   - Go to https://azure.microsoft.com/
   - Sign up or log in

2. **Create an Azure OpenAI Resource**
   - Navigate to Azure Portal
   - Search for "Azure OpenAI"
   - Click "Create"
   - Fill in the required details (subscription, resource group, region, name)
   - Wait for deployment to complete

3. **Get Your API Key and Endpoint**
   - Go to your Azure OpenAI resource
   - Navigate to "Keys and Endpoint"
   - Copy one of the keys and the endpoint URL

4. **Create a Deployment**
   - In your Azure OpenAI resource, go to "Model deployments"
   - Click "Create new deployment"
   - Choose a model (e.g., gpt-4, gpt-35-turbo)
   - Give it a deployment name
   - Copy this deployment name

5. **Update Configuration**
   - Add the credentials to your application.properties or environment variables
   - Restart the application

## Features

The AI Assistant provides:

1. **Portfolio Summary**
   - Total asset value
   - Asset allocation breakdown
   - Number of holdings

2. **Expense Analysis**
   - Monthly expense trends
   - Category-wise breakdown
   - Income vs. Expense comparison

3. **Performance Analysis**
   - Individual stock returns
   - Mutual fund performance
   - Overall portfolio returns
   - Gains/losses

## Usage

Once configured, users can:
- Navigate to "AI Assistant" from the menu
- Chat with the AI about their finances
- Get personalized insights
- Ask for recommendations

## API Endpoint

- **POST** `/api/ai/chat`
  - Request body: `{"message": "your question"}`
  - Response: `{"response": "AI response"}`
  - Requires authentication (JWT token)

## Troubleshooting

If you encounter issues:

1. **401 Unauthorized**: Check your API key
2. **404 Not Found**: Verify your endpoint URL
3. **Deployment not found**: Confirm your deployment name
4. **Rate limits**: Check your Azure OpenAI quota
5. **Spring AI version**: Ensure you're using Spring AI 1.0.0-M4 or later
