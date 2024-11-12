HOST = "localhost"  # Replace with your host
PORT = 5050        # Replace with your port

import asyncio
import os
from dotenv import load_dotenv
from typing import TypedDict, Optional, Dict, Any, List
from datetime import datetime
import json

from llama_stack_client import LlamaStackClient
from llama_stack_client.lib.agents.agent import Agent
from llama_stack_client.lib.agents.event_logger import EventLogger
from llama_stack_client.types.agent_create_params import (
    AgentConfig,
    AgentConfigToolSearchToolDefinition,
)
from llama_stack_client.types.tool_param_definition_param import ToolParamDefinitionParam
from llama_stack_client.types import CompletionMessage,ToolResponseMessage
from llama_stack_client.lib.agents.custom_tool import CustomTool


# Load environment variables
load_dotenv()

# Helper function to create an agent with tools
async def create_tool_agent(
    client: LlamaStackClient,
    tools: List[Dict],
    instructions: str = "You are a helpful assistant",
    # model: str = "Llama3.2-11B-Vision-Instruct",
    model: str = "Llama3.2-1B-Instruct",
) -> Agent:
    """Create an agent with specified tools."""
    print("Using the following model: ", model)
    agent_config = AgentConfig(
        model=model,
        instructions=instructions,
        sampling_params={
            "strategy": "greedy",
            "temperature": 1.0,
            "top_p": 0.9,
        },
        tools=tools,
        tool_choice="auto",
        tool_prompt_format="json",
        enable_session_persistence=True,
    )

    return Agent(client, agent_config)


async def create_search_agent(client: LlamaStackClient) -> Agent:
    """Create an agent with Brave Search capability."""
    print(os.getenv("BRAVE_SEARCH_API_KEY"))
    search_tool = AgentConfigToolSearchToolDefinition(
        type="brave_search",
        engine="brave",
        # api_key="dummy_value"
        api_key=os.getenv("BRAVE_SEARCH_API_KEY"),
    )

    models_response = client.models.list()
    for model in models_response:
        if model.identifier.endswith("Instruct"):
            model_name = model.llama_model


    return await create_tool_agent(
        client=client,
        tools=[search_tool],
        model = model_name,
        # instructions="""
        # You are a research assistant that can search the web.
        # Always cite your sources with URLs when providing information.
        # Format your responses as:

        # FINDINGS:
        # [Your summary here]

        # SOURCES:
        # - [Source title](URL)
        # """

        instructions="""
        You are a data entry clerk assistant that fills out forms based on the user input. 
        If no information is provided, do not fill out that field and leave it blank.
        Format your responses as :

        
        Name_of_Business_DBA:
        [Name of Business DBA]

        Business_Phone:
        [Business Phone]
        
        Business_Address:
        [Business Address include street directions and suite number if applicable]

        City:
        [City]

        Zip:
        [Zip]

        Business_Email:
        [Business Email]

        Seating_Bed_Capacity_Licensed_Healthcare:
        [Seating Bed Capacity]

        Square_Footage:
        [Square Footage]

        Hours:
        [Hours]

        LP:
        [LP]

        LLP:
        [LLP]

        Corporation:
        [Corporation]

        LLC:
        [LLC]

        Business_Owner:
        [Business Owner]

        Owner_Phone:
        [Owner Phone]
      """
    )

# Example usage
async def search_example():
    client = LlamaStackClient(base_url=f"http://{HOST}:{PORT}")
    agent = await create_search_agent(client)

    # Create a session
    session_id = agent.create_session("search-session")

    # Example queries
    queries = [
        
        # "What are the latest developments in quantum computing?",
        """
        Can you help fill in my information for the form. Only use the information I give you:
        My name is Mukul Mahadik and I am the owner of a restaurant in San Francisco. 
        My business name is Mukul's Restaurant.
        The restaurant is located at 123 Main Street, San Francisco, CA 94105.
        """,
        #"Who won the most recent Super Bowl?",
    ]

    for query in queries:
        print(f"\nQuery: {query}")
        print("-" * 50)

        response = agent.create_turn(
            messages=[{"role": "user", "content": query}],
            session_id=session_id,
        )

        async for log in EventLogger().log(response):
            log.print()

# Run the example (in Jupyter, use asyncio.run())
await search_example()

#############


class BusinessDetailsExtractionTool(CustomTool):
    """Custom tool for extracting relevant business info."""

    def get_name(self) -> str:
        return "get_business_details"

    def get_description(self) -> str:
        return "Get business details for a business to be opened by business owner"

    def get_params_definition(self) -> Dict[str, ToolParamDefinitionParam]:
        return {
            "business_owner_name": ToolParamDefinitionParam(
                param_type="str",
                description="Name of business owner",
                required=False
            ),
            "business_owner_phone": ToolParamDefinitionParam(
                param_type="str",
                description="Phone number of business owner",
                required=False
            ),
            "business_name_dba": ToolParamDefinitionParam(
                param_type="str",
                description="Name of Business DBA",
                required=False
            ),
            "business_phone": ToolParamDefinitionParam(
                param_type="str",
                description="Business phone number",
                required=False
            ),
            "business_address": ToolParamDefinitionParam(
                param_type="str",
                description="Business address including street directions and suite number if applicable",
                required=False
            ),
            "city": ToolParamDefinitionParam(
                param_type="str",
                description="City where business is located",
                required=False
            ),
            "zip_code": ToolParamDefinitionParam(
                param_type="str",
                description="ZIP code of business location",
                required=False
            ),
            # "business_email": ToolParamDefinitionParam(
            #     param_type="str",
            #     description="Business email address",
            #     required=False
            # ),
            # "seating_capacity": ToolParamDefinitionParam(
            #     param_type="str",
            #     description="Seating or bed capacity for licensed healthcare facilities",
            #     required=False
            # ),
            # "square_footage": ToolParamDefinitionParam(
            #     param_type="str",
            #     description="Square footage of the business premises",
            #     required=False
            # ),
            # "hours": ToolParamDefinitionParam(
            #     param_type="str",
            #     description="Business operating hours",
            #     required=False
            # ),
            # "is_lp": ToolParamDefinitionParam(
            #     param_type="str",
            #     description="Limited Partnership status",
            #     required=False
            # ),
            # "is_llp": ToolParamDefinitionParam(
            #     param_type="str",
            #     description="Limited Liability Partnership status",
            #     required=False
            # ),
            # "is_corporation": ToolParamDefinitionParam(
            #     param_type="str",
            #     description="Corporation status",
            #     required=False
            # ),
            # "is_llc": ToolParamDefinitionParam(
            #     param_type="str",
            #     description="Limited Liability Company status",
            #     required=False
            # ),
        }

    async def run(self, messages: List[CompletionMessage]) -> List[ToolResponseMessage]:
        assert len(messages) == 1, "Expected single message"

        message = messages[0]

        tool_call = message.tool_calls[0]
        # location = tool_call.arguments.get("location", None)
        # date = tool_call.arguments.get("date", None)
        try:
            response = await self.run_impl(**tool_call.arguments)
            response_str = json.dumps(response, ensure_ascii=False)
        except Exception as e:
            response_str = f"Error when running tool: {e}"

        message = ToolResponseMessage(
            call_id=tool_call.call_id,
            tool_name=tool_call.tool_name,
            content=response_str,
            role="system",
            # role="ipython",
        )
        return [message]

    async def run_impl(self, location: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Simulate getting weather data (replace with actual API call)."""
        # Mock implementation
        if date:
            return {
            "temperature": 90.1,
            "conditions": "sunny",
            "humidity": 40.0
        }
        return {
            "temperature": 72.5,
            "conditions": "partly cloudy",
            "humidity": 65.0
        }


async def create_business_details_extraction_agent(client: LlamaStackClient) -> Agent:
    """Create an agent with business details extraction tool capability."""
    models_response = client.models.list()
    for model in models_response:
        if model.identifier.endswith("Instruct"):
            model_name = model.llama_model
    agent_config = AgentConfig(
        model=model_name,
        instructions="""
        You are a data clerk assistant that can extract relevant information from given text description about a business.
        Check the information given by the client in the answer to the question and extract information relevant to the defined json schema.
        If you cannot find the information for any fields as defined by the tools parameters, leave them null.
        """,
        sampling_params={
            "strategy": "greedy",
            "temperature": 1.0,
            "top_p": 0.9,
        },
        tools=[
            {
                "function_name": "get_weather",
                "description": "Get weather information for a location",
                "parameters": {
                    "business_owner_name": {
                        "param_type": "str",
                        "description": "Name of business owner",
                        "required": True,
                    },
                    "business_owner_phone": {
                        "param_type": "str",
                        "description": "Phone number of business owner",
                        "required": False,
                    },
                    "business_name_dba": {
                        "param_type": "str",
                        "description": "Name of Business DBA",
                        "required": False,
                    },
                    "business_phone": {
                        "param_type": "str",
                        "description": "Business phone number",
                        "required": False,
                    },
                    "business_address": {
                        "param_type": "str",
                        "description": "Business address including street directions and suite number if applicable",
                        "required": False,
                    },
                    "city": {
                        "param_type": "str",
                        "description": "City where business is located",
                        "required": False,
                    },
                    "zip_code": {
                        "param_type": "str",
                        "description": "ZIP code of business location",
                        "required": False,
                    },
                },
                "type": "function_call",
            }
        ],
        tool_choice="auto",
        tool_prompt_format="json",
        input_shields=[],
        output_shields=[],
        enable_session_persistence=True
    )

    # Create the agent with the tool
    business_details_extraction_tool = BusinessDetailsExtractionTool()
    agent = Agent(
        client=client,
        agent_config=agent_config,
        custom_tools=[business_details_extraction_tool]
    )

    return agent

# Example usage
async def business_details_example():
    client = LlamaStackClient(base_url=f"http://{HOST}:{PORT}")
    agent = await create_business_details_extraction_agent(client)
    print(f"Agent created:")
    session_id = agent.create_session("business-details-extraction-session")

###########
    queries = [
        "What's the weather like in San Francisco?",
        "Tell me the weather in Tokyo tomorrow",
    ]

###########

    print(f"Session ID: {session_id}")

    for query in queries:
        print(f"\nQuery: {query}")
        print("-" * 50)

        response = agent.create_turn(
            messages=[{"role": "user", "content": query}],
            session_id=session_id,
        )

        print("AFter response:")

        async for log in EventLogger().log(response):
            log.print()


# Run the example
await business_details_example()
