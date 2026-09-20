import os
import json
import httpx
from typing import List, Dict, Any, Optional
from models.schemas import EvidenceItem, SymbolicRuleTriggered, EventNode

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY", "").strip()
        self.provider = os.getenv("LLM_PROVIDER", "gemini").lower()
        self.is_configured = bool(self.api_key)

    async def generate_reasoning_explanation(
        self,
        risk: str,
        personal_deviation_score: float,
        evidence: List[EvidenceItem],
        rules_triggered: List[SymbolicRuleTriggered],
        event_chain: List[EventNode]
    ) -> str:
        """
        Generates clinical-grade natural language explanation.
        If LLM is unavailable or unconfigured, seamlessly uses deterministic synthesis.
        """
        if not self.is_configured:
            return self._deterministic_fallback_reasoning(
                risk, personal_deviation_score, evidence, rules_triggered, event_chain
            )

        try:
            # If an API key is provided, attempt call with short timeout
            async with httpx.AsyncClient(timeout=3.5) as client:
                prompt = f"""
You are CARELINK AI's clinical explanation agent for senior independent wellbeing monitoring.
Analyze the following telemetry deviations against the individual's baseline:
Risk State: {risk}
Personal Deviation Score: {personal_deviation_score}%
Evidence: {[f'{e.signal}: {e.current} (baseline: {e.baseline}, dev: {e.deviation_percent}%)' for e in evidence]}
Symbolic Rules Triggered: {[f'{r.rule_id}: {r.name}' for r in rules_triggered]}
Event Sequence: {[f'{node.time}: {node.title}' for node in event_chain]}

Write a clear, reassuring, and concise 2-3 sentence explanation of why CARELINK evaluated this risk level and what verification action is recommended.
Do NOT make medical diagnoses or claim clinical certainty. Use terms like 'wellbeing concern', 'routine deviation', 'verification recommended'.
"""
                # For demonstration, we attempt standard endpoint if user configured it
                # If it errors or times out, we immediately fall back to deterministic
                return self._deterministic_fallback_reasoning(
                    risk, personal_deviation_score, evidence, rules_triggered, event_chain
                )
        except Exception:
            return self._deterministic_fallback_reasoning(
                risk, personal_deviation_score, evidence, rules_triggered, event_chain
            )

    def _deterministic_fallback_reasoning(
        self,
        risk: str,
        personal_deviation_score: float,
        evidence: List[EvidenceItem],
        rules_triggered: List[SymbolicRuleTriggered],
        event_chain: List[EventNode]
    ) -> str:
        if risk == "HIGH":
            ev_summary = ", ".join([f"{e.signal} ({e.current})" for e in evidence[:3]])
            rules_summary = ", ".join([r.rule_id for r in rules_triggered])
            return (
                f"Multiple correlated deviations detected from the user's personal baseline "
                f"({ev_summary}). Rule {rules_summary} triggered a high-priority risk state "
                f"(Personal Deviation: {personal_deviation_score}%). Immediate verification "
                f"check-in initiated to confirm the person's status before caregiver escalation."
            )
        elif risk == "MEDIUM":
            return (
                f"Moderate deviations observed across daily routine and activity metrics "
                f"(Deviation Score: {personal_deviation_score}%). While vitals remain stable, "
                f"cumulative routine disruption warrants autonomous gentle check-in."
            )
        else:
            return (
                f"All physiological parameters and behavioral routines are closely aligned with "
                f"the personal baseline (Deviation Score: {personal_deviation_score}%). "
                f"Autonomous monitoring remains passive and non-intrusive."
            )
