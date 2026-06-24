"""
FitGENIE - PDF Report Service
Generates professional downloadable PDF fitness reports using ReportLab.
"""

import io
import os
from datetime import datetime
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, cm
    from reportlab.lib.colors import HexColor, white, black
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


# Brand colors
BLUE = HexColor("#3b82f6") if REPORTLAB_AVAILABLE else None
CYAN = HexColor("#06b6d4") if REPORTLAB_AVAILABLE else None
GREEN = HexColor("#10b981") if REPORTLAB_AVAILABLE else None
PURPLE = HexColor("#8b5cf6") if REPORTLAB_AVAILABLE else None
DARK = HexColor("#1e293b") if REPORTLAB_AVAILABLE else None
LIGHT_BG = HexColor("#f0f9ff") if REPORTLAB_AVAILABLE else None
GRAY = HexColor("#64748b") if REPORTLAB_AVAILABLE else None


def generate_fitness_pdf(report_data: Dict[str, Any]) -> bytes:
    """
    Generate a professional PDF fitness report.
    
    Args:
        report_data: Complete fitness analysis data
    
    Returns:
        PDF file as bytes
    """
    if not REPORTLAB_AVAILABLE:
        raise ImportError("ReportLab not installed. Run: pip install reportlab")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm
    )

    styles = _build_styles()
    story = []

    # --- HEADER ---
    story.extend(_build_header(styles, report_data))
    story.append(Spacer(1, 0.3 * inch))

    # --- USER PROFILE ---
    story.extend(_build_profile_section(styles, report_data))
    story.append(Spacer(1, 0.2 * inch))

    # --- BMI & BMR ---
    story.extend(_build_metrics_section(styles, report_data))
    story.append(Spacer(1, 0.2 * inch))

    # --- FITNESS SCORE ---
    story.extend(_build_score_section(styles, report_data))
    story.append(Spacer(1, 0.2 * inch))

    # --- AI INSIGHTS ---
    story.extend(_build_ai_insights_section(styles, report_data))
    story.append(Spacer(1, 0.2 * inch))

    # --- WORKOUT PLAN ---
    story.extend(_build_workout_section(styles, report_data))
    story.append(Spacer(1, 0.2 * inch))

    # --- DIET PLAN ---
    story.extend(_build_diet_section(styles, report_data))
    story.append(Spacer(1, 0.2 * inch))

    # --- FOOTER ---
    story.extend(_build_footer(styles))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def _build_styles() -> dict:
    """Build custom paragraph styles."""
    base = getSampleStyleSheet()

    styles = {
        "title": ParagraphStyle(
            "title", fontSize=24, fontName="Helvetica-Bold",
            textColor=BLUE, alignment=TA_CENTER, spaceAfter=4
        ),
        "tagline": ParagraphStyle(
            "tagline", fontSize=12, fontName="Helvetica",
            textColor=CYAN, alignment=TA_CENTER, spaceAfter=2
        ),
        "section_header": ParagraphStyle(
            "section_header", fontSize=14, fontName="Helvetica-Bold",
            textColor=BLUE, spaceBefore=8, spaceAfter=6
        ),
        "body": ParagraphStyle(
            "body", fontSize=10, fontName="Helvetica",
            textColor=DARK, spaceAfter=4, leading=14
        ),
        "label": ParagraphStyle(
            "label", fontSize=9, fontName="Helvetica-Bold",
            textColor=GRAY, spaceAfter=2
        ),
        "value": ParagraphStyle(
            "value", fontSize=11, fontName="Helvetica-Bold",
            textColor=DARK, spaceAfter=4
        ),
        "bullet": ParagraphStyle(
            "bullet", fontSize=10, fontName="Helvetica",
            textColor=DARK, leftIndent=12, spaceAfter=3,
            bulletIndent=0
        ),
        "small": ParagraphStyle(
            "small", fontSize=8, fontName="Helvetica",
            textColor=GRAY, alignment=TA_CENTER
        )
    }
    return styles


def _build_header(styles, data):
    """Build PDF header with branding."""
    elements = []
    elements.append(Paragraph("🏋️ FITGENIE AI AGENT", styles["title"]))
    elements.append(Paragraph("Your Personal AI Fitness, Nutrition & Posture Coach", styles["tagline"]))
    elements.append(Paragraph(f"Report Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", styles["small"]))
    elements.append(HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=6))
    return elements


def _build_profile_section(styles, data):
    """Build user profile section."""
    profile = data.get("profile", {})
    elements = []
    elements.append(Paragraph("👤 USER PROFILE", styles["section_header"]))

    table_data = [
        ["Field", "Value", "Field", "Value"],
        ["Age", f"{profile.get('age', 'N/A')} years",
         "Gender", profile.get('gender', 'N/A').title()],
        ["Height", f"{profile.get('height', 'N/A')} cm",
         "Weight", f"{profile.get('weight', 'N/A')} kg"],
        ["Activity Level", profile.get('activity_level', 'N/A').replace('_', ' ').title(),
         "Diet Preference", profile.get('diet_preference', 'N/A').replace('_', ' ').title()],
        ["Fitness Goal", profile.get('fitness_goal', 'N/A').replace('_', ' ').title(), "", ""],
    ]

    table = Table(table_data, colWidths=[3.5 * cm, 5 * cm, 3.5 * cm, 5 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_BG),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 1), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_BG]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)
    return elements


def _build_metrics_section(styles, data):
    """Build BMI & BMR metrics section."""
    bmi = data.get("bmi", {})
    bmr = data.get("bmr", {})
    calories = data.get("calories", {})
    elements = []

    elements.append(Paragraph("📊 HEALTH METRICS", styles["section_header"]))

    metrics_data = [
        ["Metric", "Value", "Status"],
        ["BMI", f"{bmi.get('bmi', 'N/A')}", bmi.get('category', 'N/A')],
        ["BMR (Basal Metabolic Rate)", f"{bmr.get('bmr', 'N/A')} kcal/day", "Mifflin-St Jeor Formula"],
        ["TDEE (Total Daily Energy)", f"{bmr.get('tdee', 'N/A')} kcal/day", "Maintenance Calories"],
        ["Target Calories", f"{calories.get('target', 'N/A')} kcal/day", f"Goal-adjusted"],
        ["Daily Protein Target", f"{calories.get('protein_g', 'N/A')} g", ""],
        ["Daily Carbs Target", f"{calories.get('carbs_g', 'N/A')} g", ""],
        ["Daily Fats Target", f"{calories.get('fats_g', 'N/A')} g", ""],
    ]

    table = Table(metrics_data, colWidths=[8 * cm, 5 * cm, 4 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CYAN),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_BG]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)
    return elements


def _build_score_section(styles, data):
    """Build fitness score section."""
    score_data = data.get("fitness_score", {})
    elements = []

    elements.append(Paragraph("⚡ FITNESS SCORE", styles["section_header"]))

    score = score_data.get("score", 0)
    rating = score_data.get("rating", "N/A")

    score_text = f"<b>Overall Fitness Score: {score}/100 — {rating}</b>"
    elements.append(Paragraph(score_text, ParagraphStyle(
        "score_text", fontSize=14, fontName="Helvetica-Bold",
        textColor=GREEN, alignment=TA_CENTER, spaceAfter=8
    )))

    breakdown = score_data.get("breakdown", {})
    if breakdown:
        bd_data = [
            ["Component", "Score", "Max"],
            ["BMI Optimization", breakdown.get("bmi_score", 0), 40],
            ["Activity Level", breakdown.get("activity_score", 0), 30],
            ["Age Factor", breakdown.get("age_score", 0), 15],
            ["Goal Alignment", breakdown.get("goal_bonus", 0), 15],
            ["TOTAL", score, 100],
        ]
        table = Table(bd_data, colWidths=[8 * cm, 4 * cm, 4 * cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), GREEN),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("BACKGROUND", (0, -1), (-1, -1), LIGHT_BG),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, GRAY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [white, LIGHT_BG]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(table)

    return elements


def _build_ai_insights_section(styles, data):
    """Build AI analysis insights section."""
    analysis = data.get("ai_analysis", {})
    elements = []

    if not analysis:
        return elements

    elements.append(Paragraph("🤖 AI ANALYSIS & INSIGHTS", styles["section_header"]))

    health_text = analysis.get("health_analysis", "")
    if health_text:
        elements.append(Paragraph(health_text, styles["body"]))
        elements.append(Spacer(1, 6))

    motivation = analysis.get("motivation_message", "")
    if motivation:
        elements.append(Paragraph(f"💪 {motivation}", ParagraphStyle(
            "motivation", fontSize=11, fontName="Helvetica-Bold",
            textColor=PURPLE, alignment=TA_CENTER, spaceAfter=6
        )))

    daily_habits = analysis.get("daily_habits", [])
    if daily_habits:
        elements.append(Paragraph("Daily Habits for Success:", styles["label"]))
        for habit in daily_habits:
            elements.append(Paragraph(f"• {habit}", styles["bullet"]))

    return elements


def _build_workout_section(styles, data):
    """Build workout plan summary section."""
    workout = data.get("workout_plan", {})
    elements = []

    if not workout:
        return elements

    elements.append(Paragraph("🏋️ WEEKLY WORKOUT PLAN", styles["section_header"]))

    weekly = workout.get("weekly_plan", [])
    for day_plan in weekly[:7]:
        day = day_plan.get("day", "")
        type_ = day_plan.get("type", "")
        is_rest = day_plan.get("is_rest", False)

        if is_rest:
            elements.append(Paragraph(f"<b>{day}</b> — Rest & Active Recovery", styles["body"]))
        else:
            exercises = day_plan.get("exercises", [])
            ex_names = [e["name"] for e in exercises[:4]]
            elements.append(Paragraph(
                f"<b>{day}</b> ({type_}): {', '.join(ex_names)}",
                styles["body"]
            ))

    notes = workout.get("notes", [])
    if notes:
        elements.append(Spacer(1, 4))
        elements.append(Paragraph("Important Notes:", styles["label"]))
        for note in notes:
            elements.append(Paragraph(f"• {note}", styles["bullet"]))

    return elements


def _build_diet_section(styles, data):
    """Build diet plan section."""
    diet = data.get("diet_plan", {})
    elements = []

    if not diet:
        return elements

    elements.append(Paragraph("🥗 DAILY DIET PLAN", styles["section_header"]))

    targets = diet.get("daily_targets", {})
    elements.append(Paragraph(
        f"Target: {targets.get('calories', 'N/A')} kcal | "
        f"Protein: {targets.get('protein_g', 'N/A')}g | "
        f"Carbs: {targets.get('carbs_g', 'N/A')}g | "
        f"Fats: {targets.get('fats_g', 'N/A')}g",
        styles["body"]
    ))

    meals = diet.get("meals", {})
    meal_order = ["breakfast", "morning_snack", "lunch", "evening_snack", "dinner"]
    meal_names = {
        "breakfast": "🌅 Breakfast",
        "morning_snack": "🍎 Morning Snack",
        "lunch": "☀️ Lunch",
        "evening_snack": "🌙 Evening Snack",
        "dinner": "🌙 Dinner"
    }

    for key in meal_order:
        meal = meals.get(key)
        if meal:
            elements.append(Paragraph(
                f"<b>{meal_names[key]}</b> ({meal.get('meal_time', '')}): "
                f"{meal.get('name', '')} — {meal.get('calories', 0)} kcal | "
                f"P: {meal.get('protein', 0)}g | C: {meal.get('carbs', 0)}g | F: {meal.get('fats', 0)}g",
                styles["bullet"]
            ))

    supplements = diet.get("supplements", [])
    if supplements:
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(
            f"Recommended Supplements: {', '.join(supplements)}",
            styles["small"]
        ))

    return elements


def _build_footer(styles):
    """Build PDF footer."""
    elements = []
    elements.append(HRFlowable(width="100%", thickness=1, color=BLUE, spaceBefore=12))
    elements.append(Paragraph(
        "Generated by FitGenie AI | Your Personal AI Fitness Coach | "
        "⚠️ Consult a healthcare professional before starting any diet or workout program.",
        ParagraphStyle("footer", fontSize=7, fontName="Helvetica", textColor=GRAY, alignment=TA_CENTER)
    ))
    return elements
