from fastapi.testclient import TestClient


def test_home_data_only_returns_published_episodes(client: TestClient) -> None:
    response = client.get("/api/v1/episodes")

    assert response.status_code == 200
    episodes = response.json()["items"]
    assert episodes
    assert all(episode["is_published"] for episode in episodes)
    assert episodes[0]["level"] == 1


def test_episode_detail_contains_learning_content(client: TestClient) -> None:
    response = client.get("/api/v1/episodes/l1-01-the-lost-kitten")

    assert response.status_code == 200
    episode = response.json()
    assert episode["local_video_filename"].endswith(".mp4")
    assert episode["sentences"]
    assert episode["vocab"]
    assert episode["knowledge"]


def test_dictation_records_a_gentle_mistake_and_updates_stats(client: TestClient) -> None:
    before = client.get("/api/v1/stats").json()
    response = client.post(
        "/api/v1/practice/dictation",
        json={"vocab_id": "vocab-kitten", "answer": "kittenn", "mode": "meaning"},
    )

    assert response.status_code == 200
    result = response.json()
    assert result["is_correct"] is False
    assert "再试" in result["message"]
    assert client.get("/api/v1/stats").json()["practice_count"] == before["practice_count"] + 1


def test_speaking_can_be_manually_corrected(client: TestClient) -> None:
    attempt = client.post(
        "/api/v1/practice/speaking",
        json={"sentence_id": "sentence-1", "transcript": "hello puppy"},
    ).json()
    assert attempt["is_correct"] is False

    corrected = client.post(f"/api/v1/practice/attempts/{attempt['attempt_id']}/correct")
    assert corrected.status_code == 200
    assert corrected.json()["is_correct"] is True


def test_demo_login_returns_child_profile(client: TestClient) -> None:
    response = client.post("/api/v1/auth/login", json={"email": "parent@example.com"})

    assert response.status_code == 200
    assert response.json()["profile"]["display_name"] == "小咪"
