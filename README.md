# lftrndt-js-2

[Demo](https://jenkasia.github.io/lftrndt-js-2/)

### Important notice (please reade before)

In the given task, I were required to generate an XML file with temperature details of a selected week, but it's not possible to directly access the local file system on the frontend. To overcome this limitation, I used a technique to simulate a file download.

I added a button labeled "Generate XML" and attached an event listener to it. When the button is clicked, the listener retrieves the data and generates an XML content string based on the selected week. This XML content is then saved as a file in memory using a download link.

This technique allowed us to generate an XML file with temperature details without directly accessing the local file system on the frontend. Instead, we simulated a file download by creating a Blob object in memory and programmatically triggering a download.
