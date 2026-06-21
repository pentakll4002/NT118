from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import json
import tempfile
import config.setting as config

router = APIRouter(prefix="/api/voice", tags=["voice"])

class VoiceTextRequest(BaseModel):
    text: str

class VoiceResponse(BaseModel):
    text: str
    action: str
    params: Dict[str, Any]
    response_message: str

def parse_intent_with_llm(query: str) -> Dict[str, Any]:
    try:
        from llm.client import get_llm_client
        llm_client = get_llm_client(config.MODEL_TYPE)
        
        system_prompt = """Bạn là trợ lý ảo ShopeeLite, hỗ trợ người dùng mua sắm bằng giọng nói.
Từ câu nói của người dùng (đã được chuyển thành văn bản), hãy phân tích ý định (Intent) và trích xuất các thông tin chi tiết để trả về một JSON duy nhất.

Các hành động (action) được hỗ trợ:
1. "SEARCH": Khi người dùng muốn tìm kiếm sản phẩm.
   Các tham số (params):
   - "q": Từ khóa tìm kiếm chính (tên sản phẩm, dòng sản phẩm, ví dụ: "giày chạy bộ", "iPhone 15").
   - "category": Danh mục sản phẩm (ví dụ: "điện thoại", "quần áo", "giày dép").
   - "color": Màu sắc (ví dụ: "đen", "trắng", "đỏ").
   - "max_price": Mức giá tối đa (số nguyên VND, ví dụ: dưới 2 triệu -> 2000000).
   - "min_price": Mức giá tối thiểu (số nguyên VND).
2. "NAVIGATE": Khi người dùng muốn mở một màn hình hoặc trang cụ thể trong ứng dụng.
   Các tham số (params):
   - "screen": Tên màn hình đích, phải là một trong các giá trị sau:
     * "home": Trang chủ, xem sản phẩm.
     * "cart": Giỏ hàng, mua hàng.
     * "wishlist": Danh sách yêu thích, sản phẩm đã lưu.
     * "notification": Thông báo.
     * "settings": Trang cá nhân, cài đặt tài khoản.
     * "wallet": Ví điện tử ShopeePay, lịch sử giao dịch.
     * "chat": Tin nhắn, chat với shop.
     * "orders": Quản lý đơn hàng, lịch sử mua hàng.
3. "ADD_TO_CART": Khi người dùng muốn thêm sản phẩm vào giỏ hàng (ví dụ: "thêm cái này vào giỏ", "mua sản phẩm này").
   Các tham số (params):
   - "product_name": Tên sản phẩm muốn thêm (nếu có đề cập cụ thể, nếu không có để null để ám chỉ sản phẩm hiện tại đang xem).
4. "FAVORITE": Khi người dùng muốn thích hoặc thêm vào danh sách yêu thích (ví dụ: "thích sản phẩm này", "thêm vào yêu thích").
   Các tham số (params):
   - "product_name": Tên sản phẩm muốn thích (nếu có, nếu không để null).
5. "UNKNOWN": Khi câu nói không thuộc các nhóm trên hoặc không rõ nghĩa.

Chú ý sửa lỗi phát âm và viết sai chính tả của người dùng:
Người dùng có thể phát âm sai tên các thương hiệu nước ngoài sang tiếng Việt hoặc các từ đồng âm gần giống. Bạn phải TỰ ĐỘNG CHUẨN HÓA và sửa về từ khóa đúng trong tham số "q". Ví dụ:
- "asher", "a-sơ", "a sơ" -> sửa thành "Acer"
- "a-dút", "a dút", "át-xút" -> sửa thành "Asus"
- "nai-ki", "nai ky", "lai-ki" -> sửa thành "Nike"
- "a-di-dát", "a di dat", "a-đi-đát" -> sửa thành "Adidas"
- "ai-phôn", "ai phon", "ai phôn" -> sửa thành "iPhone"
- "sâm sung", "sam sung" -> sửa thành "Samsung"

Hãy trả về một câu phản hồi thân thiện bằng tiếng Việt trong trường "response_message" để trợ lý nói lại với người dùng (ví dụ: "Đã hiểu, tôi sẽ đưa bạn đến giỏ hàng ngay." hoặc "Đang tìm kiếm giày Nike màu đen giá dưới 2 triệu...").

Trả về KẾT QUẢ DUY NHẤT LÀ ĐỊNH DẠNG JSON với cấu trúc sau:
{
  "action": "SEARCH" | "NAVIGATE" | "ADD_TO_CART" | "FAVORITE" | "UNKNOWN",
  "params": { ... },
  "response_message": "Câu phản hồi thân thiện tiếng Việt"
}

Không viết bất kỳ lời giải giải thích nào khác ngoài JSON.
"""

        response_text = llm_client.chat(
            user_message=query,
            system_prompt=system_prompt
        )
        
        # Clean JSON format
        clean_text = response_text.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean_text)
        return parsed
        
    except Exception as e:
        print(f"Failed to parse intent: {e}")
        # Return fallback response
        # Detect navigation keywords manually
        query_lower = query.lower()
        if any(w in query_lower for w in ["giỏ hàng", "gio hang"]):
            return {
                "action": "NAVIGATE",
                "params": {"screen": "cart"},
                "response_message": "Tôi sẽ đưa bạn đến giỏ hàng."
            }
        elif any(w in query_lower for w in ["yêu thích", "yeu thich", "thích"]):
            return {
                "action": "NAVIGATE",
                "params": {"screen": "wishlist"},
                "response_message": "Mở danh sách yêu thích cho bạn."
            }
        elif any(w in query_lower for w in ["cài đặt", "cai dat", "cá nhân", "ca nhan", "tài khoản", "tai khoan"]):
            return {
                "action": "NAVIGATE",
                "params": {"screen": "settings"},
                "response_message": "Mở trang cá nhân của bạn."
            }
        elif any(w in query_lower for w in ["ví", "vi", "shopeepay"]):
            return {
                "action": "NAVIGATE",
                "params": {"screen": "wallet"},
                "response_message": "Đang mở ví tiền của bạn."
            }
        elif any(w in query_lower for w in ["thông báo", "thong bao"]):
            return {
                "action": "NAVIGATE",
                "params": {"screen": "notification"},
                "response_message": "Đang mở trang thông báo."
            }
        elif any(w in query_lower for w in ["tin nhắn", "tin nhan", "chat"]):
            return {
                "action": "NAVIGATE",
                "params": {"screen": "chat"},
                "response_message": "Mở hộp thư tin nhắn."
            }
        elif any(w in query_lower for w in ["đơn hàng", "don hang", "lịch sử mua"]):
            return {
                "action": "NAVIGATE",
                "params": {"screen": "orders"},
                "response_message": "Đang mở lịch sử đơn hàng."
            }
        
        # Default to search
        return {
            "action": "SEARCH",
            "params": {"q": query},
            "response_message": f"Tìm kiếm từ khóa '{query}'"
        }

@router.post("/parse-text", response_model=VoiceResponse)
async def parse_text(request: VoiceTextRequest):
    """
    Parse a pre-transcribed voice text query into structured actions
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text query cannot be empty")
    
    parsed = parse_intent_with_llm(request.text)
    return VoiceResponse(
        text=request.text,
        action=parsed.get("action", "UNKNOWN"),
        params=parsed.get("params", {}),
        response_message=parsed.get("response_message", "Đã hiểu yêu cầu của bạn.")
    )

@router.post("/parse-audio", response_model=VoiceResponse)
async def parse_audio(file: UploadFile = File(...)):
    """
    Receive recorded audio, transcribe via Groq Whisper, and parse intent
    """
    # 1. Save uploaded file to a temporary file
    temp_file_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] or ".m4a"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # 2. Transcribe via Groq Whisper API
        transcribed_text = ""
        if config.GROQ_API_KEY:
            from groq import Groq
            groq_client = Groq(api_key=config.GROQ_API_KEY)
            
            with open(temp_file_path, "rb") as audio_file:
                # Groq Whisper supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
                transcription = groq_client.audio.transcriptions.create(
                    file=(os.path.basename(temp_file_path), audio_file.read()),
                    model="whisper-large-v3",
                    language="vi",
                    prompt="ShopeeLite, Acer, Asus, Apple, Nike, Adidas, Puma, iPhone, Samsung, Oppo, Xiaomi, ví ShopeePay, giỏ hàng, tìm kiếm, yêu thích",
                    response_format="verbose_json"
                )
                transcribed_text = transcription.text
        else:
            # Fallback if no Groq API Key
            print("Groq API key not found. Cannot transcribe audio.")
            raise ValueError("Groq API key not configured")
        
        if not transcribed_text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
            
        print(f"Transcribed Text: {transcribed_text}")
        
        # 3. Parse intent
        parsed = parse_intent_with_llm(transcribed_text)
        return VoiceResponse(
            text=transcribed_text,
            action=parsed.get("action", "UNKNOWN"),
            params=parsed.get("params", {}),
            response_message=parsed.get("response_message", "Đã hiểu yêu cầu của bạn.")
        )
        
    except Exception as e:
        print(f"Audio processing error: {e}")
        # fallback/mock response for demonstration if API fails
        fallback_query = "Tìm giày Nike"
        parsed = parse_intent_with_llm(fallback_query)
        return VoiceResponse(
            text=f"[Demo/Lỗi Whisper] {fallback_query}",
            action=parsed.get("action", "SEARCH"),
            params=parsed.get("params", {"q": "giày Nike"}),
            response_message="Hệ thống demo: " + parsed.get("response_message", "Đang tìm kiếm giày Nike cho bạn.")
        )
    finally:
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Failed to delete temp file: {e}")
