from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: Literal["凑凑喵英语乐园 / CouCouMeow English Land"] = "凑凑喵英语乐园 / CouCouMeow English Land"
    version: str = "0.1.0"


settings = Settings()
