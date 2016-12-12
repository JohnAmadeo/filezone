# FileZone
Online PDF viewer web app that allows users to view PDFs uploaded from local folders or a Dropbox account. 
Try it out at https://filezone.herokuapp.com/

## Documentation/Explanation of Features

### Upload

Users can upload PDFs from two sources - from files on their computer, and from Dropbox accounts. I opted 
to use a dropzone to allow easy drag-and-drop upload with the help of the **react-dropzone** module.

Since users today not only have information stored locally but also across multiple cloud storage services,
I included the option of uploading files from a Dropbox account via a **Dropbox Chooser**. (In the future, 
adding the Google Drive Picker might be a good addition)

Since FileZone is a responsive web app, the layout works on mobile as well. On mobile, however, the two buttons 
used to upload locally and from Dropbox are hidden, leaving only the Dropzone. This is becuase
mobile browsers/operating systems (e.g Chrome on iOS) allow users to tap the dropzone to bring
up a menu to upload locally, but also cloud storage apps that the user has installed on the phone.

To implement all of the upload functionality, the **superagent** module (js) and the **requests** module (Python) were used
for HTTP requests, along with the **Azure SDK** and **Dropbox SDK**.

### PDF Viewer

Uploaded PDFs are listed on the web app, and users can click on them to open the PDF in a PDF viewer in a new tab.
I initially thought of having the PDF viewer pop-up on the same page (e.g Google Drive), but decided against it
as I think it is more user-friendly to be able to quickly open multiple PDFs and place them side by side without
having to navigate to FileZone and select a file again in each new tab. I used the **PDF.js** module for the PDF viewer
and re-skinned it to give it a flat UI in keeping with recent design trends. 

### Persistence

I considered 3 choices:
- A) Remove all files upon refresh
- B) Maintain files upon refresh across the same session
- C) Maintain files across multiple sessions (e.g http://www.zenpen.io/)

I settled on maintaining files upon refresh across the same session. This means that refreshing will not cause 
uploaded files to go away, but closing a tab will and opening a new tab starts a new session. I decided on this
as C) did not account for multiple users on the same computer, and A) was untenable given that browsers like Chrome
auto refreshes tabs that have not been opened for a while which would be very annoying for users who come back
to FileZone and find all their files are gone. I implemented B) with the help of the **store2** module.

### Naming Collisions

I considered the case where a user would upload a PDF with the same name as a PDF already
uploaded to the user's "account". I thought about simply overwriting the already-uploaded
file with the same name (e.g similar to uploading to Dropbox), or giving the user
a warning/choice before overwriting (e.g similar to saving a file of the same name on MS Word), 
but found Chrome's approach (Appending a number to the end of the name) the best as it does not
hurt the user or require the user to take action. Thus, on FileZone the same approach is taken, 
and something like **samefile.pdf** becomes **samefile(1).pdf** while **alreadyexists(5).pdf** 
gets a even higher number and becomes **alreadyexists(6).pdf**. This was implemented with the
help of the **re** regex module in Python.

### Error Scenarios

In order to minimize errors, the interface when picking files both locally and on Dropbox
are set to PDFs only initially, but at least on MacOS users can switch back to *All files*
on the file picker and upload .doc, .txt, etc. To handle this, these files are not uploaded
and a dismissable alert is shown to the user.

