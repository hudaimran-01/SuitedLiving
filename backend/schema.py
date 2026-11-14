from typing import Literal, Optional

from pydantic import BaseModel

Status = Literal["observed", "barrier", "unknown"]
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
    matterport: Optional[str] = None  # still image of the home (scan thumbnail, else first photo)
    vexcel: Optional[str] = None      # aerial still, filled in later
    hasScan: bool = False
    modelId: Optional[str] = None     # Matterport model id for the SDK embed
    photos: list[str] = []            # listing photos, resized


class Listing(BaseModel):
    id: str
    name: str
    unit: Optional[str] = None
    address: str
    place: str
    price: float                      # asking price in dollars (sales only)
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
    agentNotes: list[str] = []