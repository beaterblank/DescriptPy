import eel
import shutil
import whisper_timestamped as whisper
import wx
import os
from moviepy.video.io.VideoFileClip import VideoFileClip


def reduce_strikethrough_words(strikethrough_words:list, gap:float=0.1)->list:
    """
    Reduces the list of strikethrough words by merging consecutive words
    that are closer than `gap` seconds to each other.
    """
    reduced_words = []
    current_start = None
    current_end = None
    for word in strikethrough_words:
        if current_start is None:
            current_start = float(word["start"])
            current_end = float(word["end"])
        else:
            if float(word["start"]) - current_end <= gap:
                current_end = float(word["end"])
            else:
                reduced_words.append({"start": current_start, "end": current_end})
                current_start = float(word["start"])
                current_end = float(word["end"])
    reduced_words.append({"start": current_start, "end": current_end})
    return reduced_words

@eel.expose
def getpath()->str:
    """
    Shows a file open dialog and returns the selected file path.
    If no file is selected, returns None.also copies the file into 
    ./public/temp.mp4
    """
    wildcard="*"
    app = wx.App(None)
    style = wx.FD_OPEN | wx.FD_FILE_MUST_EXIST
    dialog = wx.FileDialog(None, 'Open', wildcard=wildcard, style=style)
    if dialog.ShowModal() == wx.ID_OK:
        path = dialog.GetPath()
    else:
        path = None
    dialog.Destroy()
    shutil.copyfile(path,"./public/temp.mp4")
    return path

@eel.expose
def transcribe(size)->list:
    """
    Transcribes the audio from the video file in `./public/temp.mp4`.
    Returns the transcribed words along with their start and end times.
    """
    mdl =size
    audio = whisper.load_audio("./public/temp.mp4")
    model = whisper.load_model(mdl, device="cpu")
    result = whisper.transcribe(model, audio)
    seg = result["segments"]
    out = []
    for i in seg:
        words = i["words"]
        for word in words:
            dct = {}
            dct["text"] = word["text"]
            dct["start"] = word["start"]
            dct["end"]= word["end"]
            out.append(dct)
    result = []
    for i in range(len(out) - 1):
        result.append(out[i])
        if out[i]['end'] < out[i + 1]['start']:
            result.append({
                'text': '|-|',
                'start': out[i]['end'],
                'end': out[i + 1]['start']
            })
    result.append(out[-1])
    return result

@eel.expose
def saveVid(strikethrough_words:list,lpath:str)->None:
    """
    Saves the edited video by removing the strikethrough words
    """
    app = wx.App(None)
    style = wx.FD_OPEN | wx.FD_FILE_MUST_EXIST
    dialog = wx.FileDialog(None, "Save file", "", "", "All files (*.*)|*.*", wx.FD_SAVE | wx.FD_OVERWRITE_PROMPT)
    if dialog.ShowModal() == wx.ID_OK:
        path = dialog.GetPath()
    else:
        path = None
    clip = VideoFileClip(lpath)
    video_duration = clip.duration
    strikethrough_words = reduce_strikethrough_words(strikethrough_words)
    for word in strikethrough_words:
        start = float(word["start"])
        end = float(word["end"])
        print((start,end))
        if(start >= 0 and end <= video_duration):
            clip = clip.cutout(ta=start,tb=end)
    clip.write_videofile(path)



try:
    # remove the file if it exists
    os.remove("./public/temp.mp4")
except FileNotFoundError:
    # do nothing if the file doesn't exist
    pass

eel.init('public')
eel.start('./index.html' ,mode='chrome')

