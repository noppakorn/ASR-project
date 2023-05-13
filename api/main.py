from fastapi import Depends, FastAPI, UploadFile
from pydub import AudioSegment
import io

from model import Model, get_model

app = FastAPI()


@app.post("/order")
def order(file: UploadFile, model: Model = Depends(get_model)):
    contents = file.file.read()
    audio = AudioSegment.from_file(io.BytesIO(contents))

    audio_blob = io.BytesIO()
    audio.export(audio_blob, format="wav")

    pred = model.predict(audio_blob)

    return {
        "transcription": pred
    }
