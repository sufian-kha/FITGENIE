"""
FitGENIE - Local AI Chat Coach Service
Implements a local NLP system for answering fitness questions entirely offline.
Uses TF-IDF + Cosine Similarity matching over a rich, comprehensive fitness Q&A dataset.
Integrates user context (BMI, weight, calories, goal) for dynamic personalization.
Provides follow-up suggested questions.
"""

import re
import numpy as np
from typing import Dict, List, Optional

# Attempt to load sklearn libraries for semantic matching
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# Rich fitness knowledge base (Queries and Responses)
KNOWLEDGE_BASE = {
    "chest_workout": {
        "queries": [
            "chest workout", "chest exercise", "how to build chest", 
            "pecs workout", "bench press", "pushups", "push ups", "chest routine"
        ],
        "response": (
            "💪 **FitGENIE Chest Development Routine**:\n\n"
            "To build a strong, defined chest, focus on progressive overload across pressing and flying angles:\n"
            "1. **Flat Bench Press** (Barbell or Dumbbell): 4 sets × 6-8 reps (Strength foundation)\n"
            "2. **Incline Dumbbell Press**: 3 sets × 10-12 reps (Focuses on upper chest fibers)\n"
            "3. **Chest Dips / Weighted Push-ups**: 3 sets × 10-15 reps (Lower chest and triceps focus)\n"
            "4. **Cable Crossovers / Dumbbell Flyes**: 3 sets × 12-15 reps (Isolates chest, peaks contraction)\n\n"
            "**Form Tip**: Keep your shoulder blades retracted (pinched back) and chest flared out throughout the lift to keep tension on the pecs, not the front deltoids. Rest 90-120 seconds between sets."
        ),
        "suggested_questions": [
            "How do I improve my push-up form?",
            "Give me a shoulder workout",
            "What should I eat for muscle building?"
        ]
    },
    "back_workout": {
        "queries": [
            "back workout", "back exercise", "lats workout", "how to build back",
            "pullups", "pull ups", "deadlift", "rows", "back routine"
        ],
        "response": (
            "🏋️‍♂️ **FitGENIE Back Width & Thickness Routine**:\n\n"
            "A well-rounded back requires pulling in both vertical (width) and horizontal (thickness) planes:\n"
            "1. **Pull-Ups / Lat Pulldowns**: 4 sets × 8-10 reps (Key for back width & V-taper)\n"
            "2. **Bent-Over Barbell Rows**: 4 sets × 8-10 reps (Key for back thickness and posture)\n"
            "3. **Single-Arm Dumbbell Rows**: 3 sets × 10-12 reps per side (Corrects strength imbalances)\n"
            "4. **Face Pulls**: 3 sets × 15-20 reps (Targets rear delts and mid-traps, crucial for shoulder health)\n\n"
            "**Form Tip**: Pull with your elbows rather than your hands to fully engage the latissimus dorsi. Squeeze your shoulder blades together at the peak of each row."
        ),
        "suggested_questions": [
            "How do I fix slouching?",
            "Give me a chest workout",
            "What's a good post-workout meal?"
        ]
    },
    "leg_workout": {
        "queries": [
            "leg workout", "leg exercise", "quads", "glutes", "hamstrings", 
            "squats", "lunges", "calves", "how to build legs", "leg routine"
        ],
        "response": (
            "🦵 **FitGENIE Lower Body (Legs) Routine**:\n\n"
            "Leg training is demanding but essential for overall body balance and metabolic rate:\n"
            "1. **Back Squats**: 4 sets × 6-8 reps (The king of leg exercises for overall development)\n"
            "2. **Romanian Deadlifts (RDLs)**: 3 sets × 8-10 reps (Focuses on hamstrings, glutes, and lower back)\n"
            "3. **Leg Press**: 3 sets × 10-12 reps (Allows safe high-volume quad stimulation)\n"
            "4. **Walking Lunges**: 3 sets × 12 reps per leg (Unilateral balance & glutes)\n"
            "5. **Standing Calf Raises**: 4 sets × 15-20 reps (Targets lower leg muscles)\n\n"
            "**Safety Tip**: Keep your knees tracking directly in line with your toes. Don't let your knees cave inward (valgus collapse) during squats or lunges."
        ),
        "suggested_questions": [
            "How do I squat with correct form?",
            "How many calories should I eat today?",
            "Give me a core workout"
        ]
    },
    "shoulder_workout": {
        "queries": [
            "shoulder workout", "shoulder exercise", "delts", "overhead press",
            "lateral raises", "shoulders routine", "how to build shoulders"
        ],
        "response": (
            "💪 **FitGENIE 3D Shoulders Routine**:\n\n"
            "The shoulder (deltoid) has three distinct heads that need targeted training for that 3D look:\n"
            "1. **Overhead Barbell/Dumbbell Press**: 4 sets × 8-10 reps (Primary builder for anterior/front delts)\n"
            "2. **Dumbbell Lateral Raises**: 4 sets × 12-15 reps (Targets lateral/side delts, creates shoulder width)\n"
            "3. **Bent-Over Rear Delt Flyes**: 3 sets × 15 reps (Targets posterior/rear delts, rounds out shoulders)\n"
            "4. **Dumbbell Shrugs**: 3 sets × 12 reps (Targets upper traps for neck support)\n\n"
            "**Form Tip**: During lateral raises, tilt your hands slightly as if pouring water out of a pitcher to keep the tension on the side deltoid fibers, and avoid shrugging up with your traps."
        ),
        "suggested_questions": [
            "How do I fix uneven shoulders?",
            "Give me a chest workout",
            "How much protein do I need?"
        ]
    },
    "core_workout": {
        "queries": [
            "core workout", "abs workout", "abdominal", "plank", "crunches",
            "russian twists", "six pack", "abs routine", "get abs"
        ],
        "response": (
            "🧘 **FitGENIE Core Stability & Abs Routine**:\n\n"
            "A strong core stabilizes the spine and enhances force transfer across exercises:\n"
            "1. **Planks**: 3 sets × 60-second hold (Builds isometric endurance and deep core stability)\n"
            "2. **Hanging Leg Raises**: 3 sets × 12-15 reps (Excellent for lower abs and hip flexors)\n"
            "3. **Ab Wheel Rollouts / Cable Crunches**: 3 sets × 12 reps (Focuses on upper abs with progressive load)\n"
            "4. **Russian Twists**: 3 sets × 20 reps per side (Targets obliques and rotational control)\n\n"
            "**Nutrition Tip**: Remember, visible abs are revealed in the kitchen. To see your ab muscles, you must reduce your overall body fat percentage through a sustainable caloric deficit."
        ),
        "suggested_questions": [
            "How do I lose weight faster?",
            "Show me a diet suggestion",
            "How do I improve my plank hold?"
        ]
    },
    "cardio_hiit": {
        "queries": [
            "cardio", "hiit", "running", "jogging", "cycling", "fat burn",
            "stamina", "endurance", "jump rope"
        ],
        "response": (
            "🏃‍♀️ **FitGENIE Cardiovascular Training Guide**:\n\n"
            "Cardio improves heart health, increases lung capacity, and assists in caloric expenditure. You can choose between two methods:\n\n"
            "**1. High-Intensity Interval Training (HIIT)**: *Fast & Efficient*\n"
            "- Perform 30 seconds of maximum effort sprinting, followed by 30-45 seconds of active rest (walking).\n"
            "- Repeat for 15-20 minutes total. Excellent for fat loss, saving muscle, and metabolic spike (EPOC).\n\n"
            "**2. Low-Intensity Steady State (LISS)**: *Endurance & Recovery*\n"
            "- Fast walking, cycling, or jogging at a moderate pace (60-70% max heart rate) for 35-50 minutes.\n"
            "- Great for active recovery days, fat oxidation, and stress relief."
        ),
        "suggested_questions": [
            "How do I lose weight?",
            "What should I eat before running?",
            "What's the best pre-workout meal?"
        ]
    },
    "weight_loss": {
        "queries": [
            "weight loss", "how to lose weight", "fat loss", "how to burn fat",
            "cutting", "lose belly fat", "caloric deficit", "diet for weight loss"
        ],
        "response": (
            "🥗 **FitGENIE Fat Loss Guide**:\n\n"
            "Fat loss is governed by the laws of thermodynamics. To lose weight, you must create a **caloric deficit** (consume fewer calories than you burn):\n"
            "1. **Caloric Intake**: Aim for a moderate deficit of 300-500 calories below your maintenance calories (TDEE). This leads to a safe, sustainable fat loss of 0.5kg per week.\n"
            "2. **Protein Importance**: Eat high protein to preserve muscle mass while losing fat. Protein is also highly satiating, keeping you full.\n"
            "3. **Volume Eating**: Fill half your plate with leafy greens and vegetables. They are low in calories but high in volume, expanding in your stomach to signal fullness.\n"
            "4. **Hydration**: Drink plenty of water. Sometimes the brain confuses dehydration with hunger."
        ),
        "suggested_questions": [
            "What should I eat today?",
            "Give me a weight loss workout",
            "How much protein do I need?"
        ]
    },
    "weight_gain": {
        "queries": [
            "weight gain", "how to gain weight", "bulking", "build mass",
            "skinny", "gain muscle", "caloric surplus", "diet for weight gain"
        ],
        "response": (
            "🥞 **FitGENIE Healthy Weight Gain & Bulking Guide**:\n\n"
            "To gain high-quality weight (muscle mass with minimal fat gain), you must create a **caloric surplus**:\n"
            "1. **Caloric Surplus**: Eat 300-500 calories above your maintenance level. This yields a gradual gain of about 1-1.5kg per month, ideal for minimizing fat accumulation.\n"
            "2. **Nutrient Density**: Eat foods that are calorically dense but healthy. Examples: whole eggs, nuts, avocados, peanut butter, olive oil, oats, red meat, and rice.\n"
            "3. **Meal Frequency**: Eat 4-5 smaller meals throughout the day rather than 2-3 massive ones, which can cause bloating and digestive fatigue.\n"
            "4. **Strength Training**: You must pair a caloric surplus with heavy resistance training to signal to your body to use those calories to build new muscle tissue rather than store it as body fat."
        ),
        "suggested_questions": [
            "What's a good pre-workout meal?",
            "Give me a muscle building workout",
            "What supplements should I take?"
        ]
    },
    "muscle_building": {
        "queries": [
            "muscle building", "gain muscle", "hypertrophy", "how to grow muscle",
            "strength", "grow chest", "grow arms", "progressive overload"
        ],
        "response": (
            "💪 **FitGENIE Muscle Hypertrophy Blueprint**:\n\n"
            "Muscle growth requires three fundamental pillars:\n"
            "1. **Progressive Overload**: You must challenge your muscles by gradually increasing weight, reps, or volume over time. If you lift the same weights forever, your body has no reason to adapt.\n"
            "2. **High-Protein Nutrition**: Muscle is built from protein. Aim for a high protein diet to support muscle synthesis.\n"
            "3. **Adequate Recovery**: Muscles don't grow while you lift; they grow while you rest. Aim for 7-9 hours of sleep, and rest each muscle group at least 48 hours before training it again."
        ),
        "suggested_questions": [
            "How much protein do I need?",
            "What supplements should I take?",
            "Give me a workout plan suggestion"
        ]
    },
    "diet_vegetarian": {
        "queries": [
            "vegetarian", "veg diet", "vegetarian protein", "no meat",
            "paneer", "eggs", "vegetarian meals"
        ],
        "response": (
            "🥗 **FitGENIE Vegetarian Nutrition Guide**:\n\n"
            "A vegetarian diet can fully support athletic performance and muscle building. The key is sourcing high-quality complete proteins:\n"
            "1. **Dairy**: Greek Yogurt (excellent protein source), Paneer / Cottage Cheese, Milk.\n"
            "2. **Eggs**: If you consume them, eggs are the gold standard of bioavailable protein.\n"
            "3. **Legumes & Grains**: Chickpeas, lentils, black beans, edamame, and quinoa (contains all 9 essential amino acids).\n"
            "4. **Soy Products**: Tofu, Tempeh, Soy chunks.\n\n"
            "**Meal Prep Idea**: A high-protein bowl made with quinoa, grilled tofu, black beans, spinach, and a scoop of pumpkin seeds."
        ),
        "suggested_questions": [
            "What should I eat today?",
            "How much protein do I need?",
            "Show me a vegan diet guide"
        ]
    },
    "diet_vegan": {
        "queries": [
            "vegan", "vegan protein", "plant based diet", "vegan diet",
            "plant protein", "vegan meals"
        ],
        "response": (
            "🌱 **FitGENIE Plant-Based (Vegan) Nutrition Guide**:\n\n"
            "Building muscle and staying healthy on a vegan diet requires careful selection of plant-based protein combinations:\n"
            "1. **Tofu & Tempeh**: Highly versatile soy protein sources providing complete amino acid profiles.\n"
            "2. **Seitan**: Wheat gluten-based meat alternative containing over 75g of protein per 100g.\n"
            "3. **Lentils & Beans**: Excellent sources of protein and fiber. Combine with rice to create a complete protein.\n"
            "4. **Plant Protein Powders**: Pea, hemp, or brown rice protein blends help you hit your macros easily.\n\n"
            "**Key Supplementation**: Vegan athletes should consider supplementing with Vitamin B12, Vitamin D3, Iron, and Algae-based Omega-3, as these can be challenging to source in optimal amounts from plants alone."
        ),
        "suggested_questions": [
            "What should I eat today?",
            "What supplements should I take?",
            "How much protein do I need?"
        ]
    },
    "pre_post_workout": {
        "queries": [
            "pre workout", "post workout", "what to eat before workout", 
            "what to eat after workout", "preworkout", "postworkout", "workout meal"
        ],
        "response": (
            "🍌 **FitGENIE Workout Fueling Guide**:\n\n"
            "Optimize your energy levels and recovery with smart timing of nutrients:\n\n"
            "**Before Workouts (1-2 hours prior)**:\n"
            "- Focus on fast-digesting complex carbohydrates for clean, sustained energy, plus a light protein source.\n"
            "- *Examples*: Oatmeal with banana, toast with peanut butter, or rice with grilled chicken.\n\n"
            "**After Workouts (within 45-90 minutes)**:\n"
            "- Focus on fast-absorbing protein to trigger muscle protein synthesis, and carbohydrates to replenish depleted muscle glycogen stores.\n"
            "- *Examples*: A whey protein shake with a banana, Greek yogurt with berries, or salmon with sweet potatoes."
        ),
        "suggested_questions": [
            "How much water should I drink?",
            "What supplements should I take?",
            "Give me a workout routine"
        ]
    },
    "posture_correction": {
        "queries": [
            "posture", "slouching", "forward neck", "uneven shoulders",
            "back pain", "neck pain", "improve posture", "ergonomics"
        ],
        "response": (
            "🧍 **FitGENIE Posture Correction Guide**:\n\n"
            "Modern screen use often leads to rounded shoulders and head-forward posture. Correct it with this routine:\n"
            "1. **Chin Tucks**: Pull your head straight back (like making a double chin). Hold 3 seconds. Do 3 sets × 10 reps daily. Strengths deep neck flexors.\n"
            "2. **Plank Hold**: 3 sets of 45-60 seconds. Reinforces core abdominal activation and spine alignment.\n"
            "3. **Thoracic Extensions**: Rest your mid-back on a foam roller or chair boundary and open up your chest backward.\n"
            "4. **Workstation Setup**: Keep the top of your computer monitor at eye level. Sit with your feet flat on the floor, hips pushed all the way back in the chair."
        ),
        "suggested_questions": [
            "How does the AI Camera analyze my posture?",
            "Give me a core workout",
            "How do I fix uneven shoulders?"
        ]
    },
    "wellness_sleep": {
        "queries": [
            "sleep", "recovery", "water", "hydration", "rest day",
            "sore muscles", "stretching", "how to recover"
        ],
        "response": (
            "😴 **FitGENIE Wellness & Recovery Protocol**:\n\n"
            "Fitness is a 24-hour cycle. Workouts create micro-tears in muscle fibers; nutrition and recovery repair them stronger:\n"
            "1. **Sleep 7-9 Hours**: Muscle growth hormone (GH) peaks during deep slow-wave sleep. Make sleep a priority.\n"
            "2. **Hydration**: Aim for 35ml of water per kg of bodyweight daily. Dehydration reduces strength, slows recovery, and causes cramping.\n"
            "3. **Rest Days**: Take 1-2 dedicated rest days per week. Light activities like walking or yoga are encouraged to promote circulation.\n"
            "4. **Muscle Soreness (DOMS)**: If very sore, do light cardio to flush out waste products, perform dynamic stretching, and ensure your protein intake is adequate."
        ),
        "suggested_questions": [
            "How much protein do I need?",
            "What should I eat today?",
            "Show me a posture routine"
        ]
    },
    "supplements": {
        "queries": [
            "supplements", "creatine", "whey protein", "protein powder",
            "vitamins", "fish oil", "what supplement to take"
        ],
        "response": (
            "💊 **FitGENIE Evidence-Based Supplement Guide**:\n\n"
            "Supplements are the 'cherry on top' of your nutrition. They help, but they cannot replace a solid diet:\n"
            "1. **Whey / Plant Protein**: A convenient source of high-quality protein to hit your daily targets.\n"
            "2. **Creatine Monohydrate**: 3-5g daily. Heavily researched, safe, and effective for increasing muscle mass, strength, and cellular hydration.\n"
            "3. **Vitamin D3 & Omega-3**: Essential for hormone regulation, reducing joint inflammation, and overall heart/immune health.\n"
            "4. **Magnesium**: Take before bed to improve muscle relaxation and sleep quality."
        ),
        "suggested_questions": [
            "How much protein do I need?",
            "Give me a muscle building workout",
            "What's a good pre-workout meal?"
        ]
    }
}

# --- Dynamic Personalization Logic ---

def get_personalized_response(category: str, user_context: Optional[Dict]) -> str:
    """Modifies the base response template with customized calculations if user metrics are present."""
    base_response = KNOWLEDGE_BASE[category]["response"]
    if not user_context:
        return base_response

    age = user_context.get("age")
    gender = user_context.get("gender", "male")
    bmi = user_context.get("bmi")
    goal = user_context.get("fitness_goal", "general_fitness")
    activity = user_context.get("activity_level", "moderately_active")
    
    # Calculate customization tags
    custom_additions = "\n\n---\n🎯 **AI Coach Personalization for Your Profile:**\n"
    has_custom = False

    # 1. Target Calories
    if "target_calories" in user_context or "calories" in user_context:
        # Check target calories from profile or calculated
        calories = user_context.get("target_calories") or user_context.get("calories", {}).get("target", 2000)
        custom_additions += f"- Your daily target is **{int(calories)} kcal** to support your **{goal.replace('_', ' ')}** goal.\n"
        has_custom = True
    
    # 2. Protein calculation based on body weight
    weight = user_context.get("weight")
    if not weight and "weight" in user_context.get("profile", {}):
        weight = user_context["profile"]["weight"]

    if weight:
        weight = float(weight)
        # 1.6 to 2.2g per kg
        p_min = round(weight * 1.6)
        p_max = round(weight * 2.2)
        custom_additions += f"- For your **{weight:.1f} kg** weight, target **{p_min} - {p_max}g** of protein daily.\n"
        has_custom = True

    # 3. Goal-specific advice
    goal_advice = {
        "weight_loss": "Focus on high-volume low-calorie foods and hit your steps goal.",
        "fat_loss": "Prioritize strength training + steady-state cardio to spare muscle.",
        "muscle_building": "Ensure you are in a small caloric surplus and implement progressive overload.",
        "weight_gain": "Incorporate dense carb foods (oats, rice, peanut butter) to reach your daily calorie surplus.",
        "general_fitness": "Maintain a balanced diet of lean proteins, complex carbs, and healthy fats."
    }.get(goal)
    if goal_advice:
        custom_additions += f"- **Nutrition focus**: {goal_advice}\n"
        has_custom = True

    # 4. BMI Rating
    if bmi:
        bmi = float(bmi)
        bmi_cat = "Healthy" if 18.5 <= bmi < 25 else "Underweight" if bmi < 18.5 else "Overweight" if bmi < 30 else "Obese"
        custom_additions += f"- **Body Composition**: Your current BMI is **{bmi:.1f}** ({bmi_cat}).\n"
        has_custom = True

    if has_custom:
        return base_response + custom_additions
    return base_response

# --- TF-IDF & Cosine Similarity Setup ---

# Global models to avoid rebuilding on every call
vectorizer = None
tfidf_matrix = None
category_list = []

def build_nlp_model():
    """Builds and fits the TfidfVectorizer on the knowledge base queries."""
    global vectorizer, tfidf_matrix, category_list
    if not SKLEARN_AVAILABLE:
        return

    documents = []
    category_list = []
    
    for category, content in KNOWLEDGE_BASE.items():
        for query in content["queries"]:
            documents.append(query.lower())
            category_list.append(category)
            
    vectorizer = TfidfVectorizer(stop_words='english', analyzer='word', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(documents)

# Initial fit
build_nlp_model()

# --- Public API Functions ---

def fallback_keyword_matching(message: str) -> str:
    """Resilient fallback keyword match when sklearn is not available."""
    message_lower = message.lower()
    
    best_category = None
    best_score = 0
    
    for category, content in KNOWLEDGE_BASE.items():
        score = 0
        for query in content["queries"]:
            # Check if query is fully inside message or words match
            if query in message_lower:
                score += len(query)  # Weight longer matching query phrases higher
        
        if score > best_score:
            best_score = score
            best_category = category
            
    return best_category

def match_local_coach_response(message: str, user_context: Optional[Dict] = None) -> Dict:
    """
    Main matching interface. Compares message to database,
    returns formatted advice response + suggested questions.
    """
    message_cleaned = re.sub(r'[^\w\s]', '', message.lower()).strip()
    matched_category = None

    if SKLEARN_AVAILABLE and vectorizer is not None:
        try:
            # Vectorize user message
            user_vec = vectorizer.transform([message_cleaned])
            similarities = cosine_similarity(user_vec, tfidf_matrix).flatten()
            best_idx = int(np.argmax(similarities))
            
            # Threshold to ensure we don't return garbage matches
            if similarities[best_idx] > 0.25:
                matched_category = category_list[best_idx]
        except Exception as e:
            print(f"Local NLP Match Error: {e}")
            
    # Fallback to keyword matching if similarity fails or sklearn unavailable
    if not matched_category:
        matched_category = fallback_keyword_matching(message_cleaned)

    # Resolve Response content
    if matched_category:
        response_text = get_personalized_response(matched_category, user_context)
        suggested = KNOWLEDGE_BASE[matched_category]["suggested_questions"]
    else:
        # Default General Response
        response_text = (
            "👋 Hello! I am your **FitGENIE AI Coach**, running entirely locally on your system.\n\n"
            "I'm here to support your fitness journey. Ask me questions like:\n"
            "- *'What exercises should I do for my chest or back?'*\n"
            "- *'How can I lose weight or gain weight safely?'*\n"
            "- *'What are some healthy plant-based protein options?'*\n"
            "- *'How do I correct my posture and prevent slouching?'*\n\n"
            "Please tell me what your goals are, or click one of the suggested questions below!"
        )
        suggested = [
            "Give me a chest workout",
            "What should I eat today?",
            "How do I improve my posture?"
        ]

    return {
        "response": response_text,
        "role": "assistant",
        "suggested_questions": suggested
    }
