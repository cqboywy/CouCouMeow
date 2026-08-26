import hashlib

from .models import CleanSentence


def hash_sentences(sentences: list[CleanSentence]) -> str:
    normalized = "\n".join(sentence.text for sentence in sentences)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

