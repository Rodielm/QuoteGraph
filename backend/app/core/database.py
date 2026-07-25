from collections.abc import Generator

from neo4j import Driver, GraphDatabase

from app.core.config import settings

_driver: Driver = GraphDatabase.driver(
    settings.neo4j_uri,
    auth=(settings.neo4j_user, settings.neo4j_password),
)


def get_driver() -> Driver:
    return _driver


def get_session() -> Generator:
    with _driver.session() as session:
        yield session


def close_driver() -> None:
    _driver.close()
