import os
from collections import Counter
import google.generativeai as genai

def get_majority_city(activities: list[dict]) -> str:
    cities = [a.get("city", "") for a in activities if a.get("city")]
    if not cities:
        return "the destination"
    return Counter(cities).most_common(1)[0][0]

def suggest_hotel_area(activities: list[dict]) -> dict:
    city = get_majority_city(activities)
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("No API key found")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            f"In one friendly sentence, recommend the best hotel area to stay "
            f"in {city} for a tourist who wants to be close to the main attractions. "
            f"No bullet points or headings."
        )
        response = model.generate_content(prompt)
        suggestion = response.text.strip()
    except Exception:
        suggestion = (
            f"We recommend staying in the city centre of {city} "
            f"to be close to your activities."
        )
    return {
        "city": city,
        "suggestion": suggestion,
        "booking_link": f"https://www.booking.com/search.html?ss={city.replace(' ', '+')}"
    }