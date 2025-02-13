from fastapi import FastAPI
from services.kafka_consumer_service import KafkaConsumerService
from conf.database import get_db
import asyncio
import logging

app = FastAPI()

# ✅ 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ Kafka Consumer 인스턴스 초기화
kafka_consumer_service = None

@app.on_event("startup")
async def startup_event():
    """FastAPI 시작 시 Kafka Consumer & Producer 실행"""
    global kafka_consumer_service

    # ✅ 비동기적으로 DB 세션 가져오기
    async for db_session in get_db():
        db = db_session
        break  # 첫 번째 AsyncSession만 사용

    # ✅ Kafka Consumer 서비스 초기화
    kafka_consumer_service = KafkaConsumerService(
        bootstrap_servers="kafka:9092", 
        group_id="business_license_group", 
        db=db  # ✅ 올바른 AsyncSession 전달
    )

    await kafka_consumer_service.start()  # ✅ Kafka Producer 시작
    # loop = asyncio.get_event_loop()
    # loop.create_task(kafka_consumer_service.start_consumer("business_license_request"))
    # ✅ 여러 개의 토픽을 동시에 실행
    topics = ["business_license_request", "certificate_request"]
    asyncio.create_task(kafka_consumer_service.start_consumer(topics))

@app.on_event("shutdown")
async def shutdown_event():
    """FastAPI 종료 시 Kafka Consumer & Producer 정리"""
    if kafka_consumer_service:
        if kafka_consumer_service.consumer:
            await kafka_consumer_service.consumer.stop()
        await kafka_consumer_service.stop()  # ✅ Kafka Producer 종료