from typing import Literal, Optional

from pydantic import BaseModel

# categorical descripitons of possible accesibility issues/bonuses
Status = Literal["observed", "barrier", "unknown"]

# source of said data
Source = Literal["CoStar", "Vexcel", "Matterport"]
CHECK_IDS = ["step-free", "elevator", "parking", "short-walk", "doorways", "bathroom",
             "lighting", "contrast", "signage", "alarms", "doorbell", "intercom"]


class Finding(BaseModel):
    status: Status
    source: Source
    scene: str
    title: str
    detail: str
    ask: Optional[str] = None


class Investigation(BaseModel):
    source: Source
    text: str


class Images(BaseModel):
    matterport: Optional[str] = None  # still image of the home (scan thumbnail, else first photo available)
    vexcel: Optional[str] = None      # aerial still, filled in later 
    hasScan: bool = False
    modelId: Optional[str] = None     # Matterport model id for the SDK embed
    photos: list[str] = []            # listing photos, resized
    floorplans: list[str] = []        # Matterport floor plan images (SVG), SHOULD be one per level


class Listing(BaseModel):
    id: str
    name: str
    unit: Optional[str] = None
    address: str
    place: str
    price: float                      # asking price in dollars (sales only NO rent)
    beds: Optional[float] = None
    baths: Optional[float] = None
    sqft: Optional[float] = None
    floor: str
    available: str
    scene: str
    images: Images
    sketchLabel: str
    investigations: list[Investigation]
    findings: dict[str, Finding]
    agentNotes: list[str] = []         # ADDEd: Specific agent notes could give more accesibility details