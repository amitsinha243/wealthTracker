package com.wealthtracker.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * DTO returned by the AI agent endpoints.
 */
public class AgentReportResponse {

    private String agentType;
    private String report;
    private String generatedAt;

    public AgentReportResponse() {}

    public AgentReportResponse(String agentType, String report) {
        this.agentType = agentType;
        this.report = report;
        this.generatedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public String getAgentType() { return agentType; }
    public void setAgentType(String agentType) { this.agentType = agentType; }

    public String getReport() { return report; }
    public void setReport(String report) { this.report = report; }

    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
}
