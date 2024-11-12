import requests
import json

from dotenv import load_dotenv
from pathlib import Path
import sys
import os

CURR_DIR = Path(__file__).parent
ROOT_DIR = CURR_DIR.parent
sys.path.append(str(CURR_DIR))

load_dotenv(ROOT_DIR / '.env')

# data needed (replace with dynamically read PDF data)
dataWeNeed = {
    '(Name of Business DBA)': None,
    '(Business Phone)': None,
    '(Business Address include street directions and suite number if applicable)': None,
    '(City)': None,
    '(Zip)': None,
    '(Business EMail)': None,
    '(Square Footage)': None,
}
# Note: We need to exit loop after it gets all the info, or else it repeats itself

class SimpleChatBot:
    def __init__(self, together_api_key, model_name="meta-llama/Llama-3.2-3B-Instruct-Turbo"):
        self.api_key = together_api_key
        self.model_name = model_name
        self.api_url = "https://api.together.xyz/inference"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.conversation = []
        self.max_history = 20
        self.debug = False

    def print_debug(self, label, content):
        if self.debug:
            print("\n" + "="*50)
            print(f"DEBUG - {label}:")
            if isinstance(content, str):
                print(content)
            else:
                print(json.dumps(content, indent=2))
            print("="*50 + "\n")

    def analyze_personal_info(self):
        """
        Analyze conversation history to extract personal information.
        """
        # Convert conversation history to a numbered format
        history = "\n".join([
            f"{i}. {msg['role']}: {msg['content']}"
            for i, msg in enumerate(self.conversation, 1)
        ])

        # Construct prompt to extract and populate form data from the conversation
        analysis_prompt = (
            "Based on the following conversation history, extract relevant information provided by the user "
            "and populate the required fields in a Python dictionary. Only include information explicitly mentioned by the user, "
            "and leave fields as None if they were not discussed in the conversation history. Format the response as a "
            "valid Python dictionary with only the keys listed below.\n"
            f"\n{dataWeNeed}\n\n"
            f"Conversation history:\n{history}\n\n"
            "Dictionary format:\n"
            "{\n"
            "    '(Name of Business DBA)': 'Example Business',\n"
            "    '(Business Phone)': '(555) 123-4567',\n"
            "    '(Business Address include street directions and suite number if applicable)': '123 Main St, Suite 101',\n"
            "    '(City)': 'Los Angeles',\n"
            "    '(Zip)': '90001',\n"
            "    '(Business EMail)': 'example@business.com',\n"
            "    '(Square Footage)': '2000'\n"
            "}\n\n"
            "Populate the dictionary based on the conversation history and return ONLY the Python dictionary, with values filled in if mentioned by the user.\n\n"
            "Dictionary of user's form data:"
        )


        payload = {
            "model": self.model_name,
            "prompt": analysis_prompt,
            "max_tokens": 100,
            "temperature":0.3,  # Decrease temperature to reduce randomness
            "top_k":20,  # Increase top-k to reduce randomness
            "top_p":0.9,  # Increase top-p to reduce randomness
            "stop": ["User:", "Assistant:", "Conversation history:"]
        }

        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if 'output' in result and 'choices' in result['output']:
                personal_info = result['output']['choices'][0]['text'].strip()
                self.print_debug("Personal Info Analysis", personal_info)
                return personal_info
            else:
                return "Error: Unexpected API response format"
                
        except requests.exceptions.RequestException as e:
            return f"API Error: {str(e)}"

    def get_response(self, user_input):
        # Add user input to conversation history
        self.conversation.append({"role": "user", "content": user_input})
        self.print_debug("Current Conversation History", self.conversation)

        # Extract the last `max_history` messages to include in the prompt
        messages = self.conversation[-self.max_history:]
        history = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in messages
        ])


        # Filter out fields that have already been provided by the user
        user_provided_data = {msg['content'] for msg in self.conversation if msg['role'] == 'user'}
        remaining_data_needed = {k: v for k, v in dataWeNeed.items() if v not in user_provided_data}

        # Update the prompt to only include remaining data needed
        prompt = (
            "You are a chatbot designed to guide users through completing a permit form, "
            "similar to an interactive assistant like TurboTax. "
            "Use the conversation history below and the data requirements in 'dataWeNeed' "
            "to ask only necessary questions and gather the required information for each field.\n\n"
            "Only ask questions about fields that haven't been provided by the user yet. "
            "Do not repeat questions the user has already answered, and focus on one field at a time.\n\n"
            "If all required information has been collected, acknowledge this and let the user know.\n\n"
            f"Here are the remaining data requirements:\n{remaining_data_needed}\n\n"
            f"Conversation history:\n{history}\n\n"
            "Based on the above history and the remaining fields in 'dataWeNeed', "
            "ask the user a relevant question to complete their permit form.\n"
            "Assistant:"
        )

        self.print_debug("Prompt Sent to Model", prompt)

        # Set up payload for API request
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "max_tokens": 100,
            "temperature": 0.1,
            "top_p": 0.7,
            "top_k": 50,
            "repetition_penalty": 1.1,
            "stop": ["\n", "User:", "Assistant:", "Conversation history:", "(Note:"] # ignore responses after newlines
        }

        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            self.print_debug("Raw API Response", result)

            if 'output' in result and 'choices' in result['output']:
                bot_response = result['output']['choices'][0]['text'].strip()
                self.conversation.append({"role": "assistant", "content": bot_response})
                if len(self.conversation) > self.max_history:
                    self.conversation = self.conversation[-self.max_history:]
                return bot_response
            else:
                return "Error: Unexpected API response format"
                    
        except requests.exceptions.RequestException as e:
            return f"API Error: {str(e)}"

    def show_memory(self):
        print("\n--- Current Conversation Memory ---")
        for i, msg in enumerate(self.conversation, 1):
            print(f"{i}. {msg['role']}: {msg['content']}")
        print("--------------------------------\n")

def main():
    API_KEY = os.getenv("TOGETHER_API_KEY")
    chatbot = SimpleChatBot(API_KEY)
    
    print("ChatBot initialized. Type 'quit' to exit.")
    print("Special commands:")
    print("  'quit' - Exit the program")
    print("  'memory' - Show current conversation memory")
    print("  'debug on/off' - Toggle debug mode")
    print(f"Using model: {chatbot.model_name}")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() == 'quit':
            print("Goodbye!")
            break
        # elif user_input.lower() == 'memory':
        #     chatbot.show_memory()
        #     continue
        # elif user_input.lower() == 'debug on':
        #     chatbot.debug = True
        #     print("Debug mode enabled")
        #     continue
        # elif user_input.lower() == 'debug off':
        #     chatbot.debug = False
        #     print("Debug mode disabled")
        #     continue
        elif user_input == "":
            print("Please enter a message.")
            continue
            
        response = chatbot.get_response(user_input)
        print(f"Bot: {response}")
        
        # After each response, analyze and display personal information
        print("\n--- Current Information Analysis ---")
        personal_info = chatbot.analyze_personal_info()

        # Find the position of the closing brace and trim everything after it (extra unecessary dialogue)
        closing_brace_pos = personal_info.find('}')
        if closing_brace_pos != -1:
            personal_info = personal_info[:closing_brace_pos + 1]

        print(personal_info)
        print("-------------------------------------\n")

if __name__ == "__main__":
    main()