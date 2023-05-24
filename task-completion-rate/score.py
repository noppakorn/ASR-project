import pandas as pd


def classify(text):
    cleaned_transcription = text.replace(" ", "")
    noodle = None
    soup = None
    spicy = None

    if "บะหมี่" in cleaned_transcription:
        noodle = "บะหมี่"
    elif "เส้นเล็ก" in cleaned_transcription:
        noodle = "เส้นเล็ก"
    elif "เส้นใหญ่" in cleaned_transcription:
        noodle = "เส้นใหญ่"

    if "น้ำ" in cleaned_transcription:
        soup = 1
    elif "แห้ง" in cleaned_transcription:
        soup = 0
    else:
        soup = 1

    if "ไม่เผ็ด" in cleaned_transcription:
        spicy = 0
    elif "เผ็ด" in cleaned_transcription or "ต้มยำ" in cleaned_transcription:
        spicy = 1
    else:
        spicy = 0

    return noodle, soup, spicy


def grade(transcription, label_df):
    sentence_id, t = transcription
    d = label_df[label_df.id == sentence_id].reset_index(
        drop=True).iloc[0, :].to_dict()
    noodle, soup, spicy = classify(t)
    print(t, d["noodle_type"] == noodle,
          d["soup"] == soup, d["spicy"] == spicy)

    return d["noodle_type"] == noodle and d["soup"] == soup and d["spicy"] == spicy


def main():
    label_df = pd.read_csv("data.csv")
    transcriptions = []
    label_df.id = label_df.id.astype(int)
    with open("../asr-part/new_results/transcriptions_bigram_kn.txt") as f:
        for line in f:
            sentence_id = int(line.split()[1])
            t = " ".join(line.split()[2:])
            transcriptions.append((sentence_id, t))

    true_cnt = 0
    for transcription in transcriptions:
        res = grade(transcription, label_df)
        if res:
            true_cnt += 1

    print("Correct count:", true_cnt)
    print("Count:", len(transcriptions))
    print("Percent:", true_cnt / len(transcriptions))


if __name__ == "__main__":
    main()
