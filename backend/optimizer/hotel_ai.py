import os
import google.generativeai as genai
from collections import Counter
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def get_majority_city(activities: list[dict]) -> str:
    """
    Day 4 Task: Takes a list of activities and returns the most frequent city.
    Kept strictly deterministic and separate from the AI call.
    """
    if not activities:
        return "Unknown"
    
    # Extract the 'city' field from each activity
    cities = [a.get("city", "Unknown") for a in activities]
    
    # Count occurrences and get the most common one
    most_common_city = Counter(cities).most_common(1)[0][0]
    return most_common_city


def suggest_hotel_area(activities: list[dict]) -> dict:
    """
    Day 6 Task: Uses the majority city to ask Gemini for a hotel neighborhood.
    Includes a safe fallback if the API fails for any reason.
    """
    target_city = get_majority_city(activities)
    
    fallback_sentence = f"The city center in {target_city} is a highly convenient area to stay close to your group's planned activities."
    
    # If no activities or city found, return a generic safe response
    if target_city == "Unknown":
         return {"city": target_city, "suggestion": "A centrally located hotel will be best for your group's itinerary."}

    # If the API key is missing, fail gracefully to the fallback
    if not api_key:
        return {"city": target_city, "suggestion": fallback_sentence}

    try:
        # Use gemini-2.5-flash as specified in the workplan
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = (
            f"I am building a travel itinerary for a group visiting {target_city}. "
            f"Suggest one specific, great neighborhood or area to stay in for a tourist. "
            f"Keep your response to exactly one short, friendly sentence."
        )
        
        response = model.generate_content(prompt)
        
        return {
            "city": target_city,
            "suggestion": response.text.strip()
        }
        
    except Exception as e:
        # If the API hits a rate limit or network error, return the templated fallback
        print(f"AI Suggestion Error: {e}")
        return {
            "city": target_city,
            "suggestion": fallback_sentence
        }