from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from llm.rag import RAGPipeline
from vectorstore.create import get_vector_store
import config.setting as config
import re
import httpx

router = APIRouter(prefix="/api/chat", tags=["chat"])

ECOMMERCE_SYSTEM_PROMPT = """Ban la "ShopAI" - tro ly tu van thuong mai dien tu cua ShopeeLite.
Tra loi bang tieng Viet, than thien va tu nhien nhu dang nhan tin.
TUYET DOI KHONG dung markdown, emoji, icon, dau gach dau dong hay so thu tu.
Ho tro khach hang ve: tim kiem san pham, dat hang, thanh toan, van chuyen, tra hang, voucher, tai khoan.
Neu khong chac chan, huong dan khach lien he hotline ho tro."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    use_rag: bool = True
    top_k: Optional[int] = None


class ProductCard(BaseModel):
    id: int
    name: str
    price: float
    image: Optional[str] = None
    rating: Optional[float] = None
    deep_link: str


class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None
    num_sources: Optional[int] = None
    products: Optional[List[ProductCard]] = None


BACKEND_URL = config.__dict__.get("BACKEND_URL", "http://localhost:5058")

PRODUCT_KEYWORDS = [
    "tim", "mua", "san pham", "sản phẩm", "tìm", "giá", "gia",
    "điện thoại", "dien thoai", "laptop", "tai nghe", "giày", "giay",
    "áo", "ao", "quần", "quan", "đồng hồ", "dong ho", "máy tính", "may tinh",
    "phụ kiện", "phu kien", "bàn phím", "ban phim", "chuột", "chuot",
    "túi", "tui", "balo", "gợi ý", "goi y", "đề xuất", "de xuat",
    "recommend", "search", "suggest", "có gì", "co gi", "loại nào", "loai nao",
    "rẻ", "re", "tốt", "tot", "nên mua", "nen mua", "giảm giá", "giam gia",
    "khuyến mãi", "khuyen mai", "voucher",
]


def is_product_query(message: str) -> bool:
    """Detect if the user message is asking about products."""
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in PRODUCT_KEYWORDS)


async def fetch_products_from_backend(query: str, max_results: int = 4) -> List[ProductCard]:
    """Search products from the .NET backend."""
    try:
        params = {"q": query, "pageSize": max_results}
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(f"{BACKEND_URL}/api/products", params=params)
            response.raise_for_status()

        data = response.json()
        if isinstance(data, dict) and "data" in data and "success" in data:
            data = data["data"]

        items = []
        if isinstance(data, dict):
            items = data.get("data", data.get("items", []))
        elif isinstance(data, list):
            items = data

        products = []
        for item in items[:max_results]:
            products.append(ProductCard(
                id=item.get("id", 0),
                name=item.get("name", ""),
                price=item.get("price", 0),
                image=item.get("image"),
                rating=item.get("rating"),
                deep_link=f"/product/{item.get('id', 0)}"
            ))
        return products
    except Exception as e:
        print(f"Failed to fetch products from backend: {e}")
        return []


_rag_pipeline = None


def get_rag_pipeline():
    global _rag_pipeline

    if _rag_pipeline is None:
        vector_store = get_vector_store()
        _rag_pipeline = RAGPipeline(vector_store, config.MODEL_TYPE)

    return _rag_pipeline


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    import traceback
    try:
        history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                history.append({
                    "role": msg.role,
                    "content": msg.content
                })

        if request.use_rag:
            try:
                rag_pipeline = get_rag_pipeline()
                result = rag_pipeline.query(
                    query=request.message,
                    conversation_history=history,
                    top_k=request.top_k
                )
                return ChatResponse(
                    answer=result["answer"],
                    sources=result.get("sources"),
                    num_sources=result.get("num_sources", 0)
                )
            except Exception as e:
                print(f"RAG failed, falling back to direct LLM: {e}")

        from llm.client import get_llm_client
        try:
            llm_client = get_llm_client(config.MODEL_TYPE)
            answer = llm_client.chat(
                user_message=request.message,
                conversation_history=history,
                system_prompt=ECOMMERCE_SYSTEM_PROMPT
            )
        except ValueError as e:
            error_detail = str(e)
            print(f"ValueError in chat: {error_detail}")
            return ChatResponse(
                answer="Xin loi ban, ShopAI tam thoi khong the ket noi. Vui long thu lai sau it phut nhe!",
                sources=None,
                num_sources=0
            )
        except ImportError as e:
            error_detail = str(e)
            print(f"ImportError in chat: {error_detail}")
            return ChatResponse(
                answer="He thong dang bao tri, ShopAI se quay lai som. Ban co the lien he hotline 1900-xxxx de duoc ho tro ngay!",
                sources=None,
                num_sources=0
            )
        except Exception as e:
            error_detail = str(e)
            traceback.print_exc()
            print(f"LLM error: {error_detail}")
            return ChatResponse(
                answer="Xin loi ban, ShopAI dang gap su co ky thuat. Vui long thu lai sau hoac lien he bo phan ho tro qua hotline 1900-xxxx nhe!",
                sources=None,
                num_sources=0
            )

        return ChatResponse(
            answer=answer,
            sources=None,
            num_sources=0,
            products=None
        )

    except HTTPException:
        raise
    except Exception as e:
        error_detail = str(e)
        traceback.print_exc()
        print(f"Unexpected error in chat endpoint: {error_detail}")
        return ChatResponse(
            answer="ShopAI xin loi vi su bat tien. He thong dang duoc khac phuc. Ban vui long thu lai sau nhe!",
            sources=None,
            num_sources=0,
            products=None
        )


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    try:
        rag_pipeline = get_rag_pipeline()

        history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                history.append({
                    "role": msg.role,
                    "content": msg.content
                })

        if request.use_rag:
            from fastapi.responses import StreamingResponse
            import json

            def generate():
                for chunk in rag_pipeline.stream_query(
                    query=request.message,
                    conversation_history=history,
                    top_k=request.top_k
                ):
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"

            return StreamingResponse(generate(), media_type="text/event-stream")
        else:
            from fastapi.responses import StreamingResponse
            from llm.client import get_llm_client
            import json

            llm_client = get_llm_client(config.MODEL_TYPE)

            def generate():
                for chunk in llm_client.stream_chat(
                    user_message=request.message,
                    conversation_history=history,
                    system_prompt=ECOMMERCE_SYSTEM_PROMPT
                ):
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"

            return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
