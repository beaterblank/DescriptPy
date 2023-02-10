import eel
import whisper_timestamped as whisper
import wx

test = {
"1": { "text": "a","f":0,"t":5 ,"highlighted": False, "struckThrough": False },
"2": { "text": "cat","f":5,"t":10 , "highlighted": False, "struckThrough": False },
"3": { "text": "meow","f":10,"t":15 , "highlighted": False, "struckThrough": False },
"4": { "text": "a","f":15,"t":20 , "highlighted": False, "struckThrough": False },
"5": { "text": "dog","f":20,"t":25 , "highlighted": False, "struckThrough": False },
"6": { "text": "bow","f":25,"t":30 , "highlighted": False, "struckThrough": False },
"7": { "text": "you","f":30,"t":35 , "highlighted": False, "struckThrough": False },
"8": { "text": "idiot", "f":35,"t":40 ,"highlighted": False, "struckThrough": False },
"9": { "text": "wtf", "f":40,"t":45 ,"highlighted": False, "struckThrough": False }
}

vidPath = ""

eel.init('public')

# @eel.expose
# def transcribe(src):
#     return test


@eel.expose
def transcribe(wildcard="*"):
    app = wx.App(None)
    style = wx.FD_OPEN | wx.FD_FILE_MUST_EXIST
    dialog = wx.FileDialog(None, 'Open', wildcard=wildcard, style=style)
    if dialog.ShowModal() == wx.ID_OK:
        path = dialog.GetPath()
    else:
        path = None
    dialog.Destroy()
    return test

eel.start('index.html',mode='default')