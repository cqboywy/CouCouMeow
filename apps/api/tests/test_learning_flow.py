from fastapi.testclient import TestClient


def test_home_data_only_returns_published_episodes(client: TestClient) -> None:
    response = client.get("/api/v1/episodes")

    assert response.status_code == 200
    episodes = response.json()["items"]
    assert episodes
    assert all(episode["is_published"] for episode in episodes)
    assert episodes[0]["level"] == 1


def test_level_one_groups_bat_and_friends_by_series_and_episode_number(client: TestClient) -> None:
    episodes = client.get("/api/v1/episodes").json()["items"]
    bat_episodes = [episode for episode in episodes if episode["series_title"] == "Bat and Friends"]

    assert [(episode["episode_number"], episode["title"]) for episode in bat_episodes] == [
        (1, "Hunting for Bugs"),
        (2, "Lost in the Rain"),
    ]

    first_episode = client.get("/api/v1/episodes/l1-bat-and-friends-001-hunting-for-bugs").json()
    assert first_episode["local_video_filename"] == "001_Bat and Friends 1_Hunting for Bugs.mp4"
    assert len(first_episode["sentences"]) == 19
    assert first_episode["story_summary"]
    assert first_episode["knowledge"]


def test_episode_detail_contains_learning_content(client: TestClient) -> None:
    response = client.get("/api/v1/episodes/l1-001-dino-buddies-the-park")

    assert response.status_code == 200
    episode = response.json()
    assert episode["series_title"] == "Dino Buddies"
    assert episode["episode_number"] == 1
    assert episode["title"] == "The Park"
    assert episode["chinese_title"] == "恐龙伙伴：公园奇遇"
    assert episode["local_video_filename"] == "001_Dino Buddies 1_The Park.mp4"
    assert len(episode["sentences"]) == 30
    assert len([item for item in episode["sentences"] if item["is_featured"]]) == 12
    assert len(episode["vocab"]) >= 15
    assert len(episode["knowledge"]) == 6
    assert all(item["examples"] for item in episode["knowledge"])
    assert episode["story_summary"]
    assert episode["comprehension_questions"]
    assert episode["retell_steps"]
    assert len(episode["past_tense_pairs"]) == 8
    assert {"base": "see", "past": "saw", "meaning": "看见"} in episode["past_tense_pairs"]
    phonetics = {item["word"]: item["phonetic"] for item in episode["vocab"]}
    assert phonetics["park"] == "/pɑːk/"
    assert phonetics["stuck"] == "/stʌk/"


def test_dictation_records_a_gentle_mistake_and_updates_stats(client: TestClient) -> None:
    before = client.get("/api/v1/stats").json()
    response = client.post(
        "/api/v1/practice/dictation",
        json={"vocab_id": "vocab-park", "answer": "parkk", "mode": "meaning"},
    )

    assert response.status_code == 200
    result = response.json()
    assert result["is_correct"] is False
    assert "再试" in result["message"]
    assert client.get("/api/v1/stats").json()["practice_count"] == before["practice_count"] + 1


def test_spoken_vocab_answer_is_recorded_separately_from_written_dictation(client: TestClient) -> None:
    response = client.post(
        "/api/v1/practice/dictation",
        json={"vocab_id": "bat-2-vocab-wet", "answer": "wet", "mode": "meaning", "answer_method": "spoken"},
    )

    assert response.status_code == 200
    result = response.json()
    assert result["is_correct"] is True
    assert result["answer_method"] == "spoken"
    assert "说对" in result["message"]


def test_speaking_can_be_manually_corrected(client: TestClient) -> None:
    attempt = client.post(
        "/api/v1/practice/speaking",
        json={"sentence_id": "sentence-1", "transcript": "Rex stayed at home"},
    ).json()
    assert attempt["is_correct"] is False

    corrected = client.post(f"/api/v1/practice/attempts/{attempt['attempt_id']}/correct")
    assert corrected.status_code == 200
    assert corrected.json()["is_correct"] is True


def test_demo_login_returns_child_profile(client: TestClient) -> None:
    response = client.post("/api/v1/auth/login", json={"email": "parent@example.com"})

    assert response.status_code == 200
    assert response.json()["profile"]["display_name"] == "小咪"


def test_web_origin_is_allowed_to_read_learning_api(client: TestClient) -> None:
    response = client.get(
        "/api/v1/episodes",
        headers={"Origin": "http://127.0.0.1:5173"},
    )

    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
