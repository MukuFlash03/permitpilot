from pydantic import BaseModel, Field
from typing import Optional


class ChatQnA(BaseModel):
  question: str
  answer: str

class BusinessDetails(BaseModel):
    """Try and only extract the core info, don't give any additional info"""
    business_owner_name: str = Field(
        ...,
        description="Name of business owner",
        alias="(Business Owner)"
    )
    business_owner_phone: str = Field(
        ...,
        description="Phone number of business owner",
        alias="(Business Owner Phone)"
    )
    business_name_dba: str = Field(
        ..., 
        description="Name of Business DBA",
        alias="(Name of Business DBA)"
    )
    business_phone: str = Field(
        ...,
        description="Business phone number",
        alias="(Business Phone)"
    )
    business_address: str = Field(
        ...,
        description="Business address including street directions and suite number if applicable",
        alias="(Business Address include street directions and suite number if applicable)"
    )
    city: str = Field(
        ...,
        description="City where business is located",
        alias="(City)"
    )
    zip_code: str = Field(
        ...,
        description="ZIP code of business location",
        alias="(Zip)"
    )
    # business_email: str = Field(
    #     None,
    #     description="Business email address",
    #     alias="(Business EMail)"
    # )
    # seating_capacity: str = Field(
    #     None,
    #     description="Seating or bed capacity for licensed healthcare facilities",
    #     alias="(Seating  Bed Capacity Licensed Healthcare)"
    # )
    # square_footage: str = Field(
    #     None,
    #     description="Square footage of the business premises",
    #     alias="(Square Footage)"
    # )
    # hours: str = Field(
    #     None,
    #     description="Business operating hours",
    #     alias="(hours)"
    # )
    # is_lp: str = Field(
    #     None,
    #     description="Limited Partnership status",
    #     alias="(LP)"
    # )
    # is_llp: str = Field(
    #     None,
    #     description="Limited Liability Partnership status",
    #     alias="(LLP)"
    # )
    # is_corporation: str = Field(
    #     None,
    #     description="Corporation status",
    #     alias="(Corporation)"
    # )
    # is_llc: str = Field(
    #     None,
    #     description="Limited Liability Company status",
    #     alias="(LLC)"
    # )

# class VoiceNote(BaseModel):
#   title: str = Field(description="A title for the voice note")
#   summary: str = Field(description="A short one sentence summary of the voice note.")
#   actionItems: list[str] = Field(
#       description="A list of action items from the voice note"
#   )
