# lftrndt-js-3

[Demo](https://jenkasia.github.io/lftrndt-js-3/)

### Important notice (please reade before)

In the given task, I were required to generate an XML file with temperature details of a selected week, but it's not possible to directly access the local file system on the frontend. To overcome this limitation, I used a technique to simulate a file download.

I added a button labeled "Generate XML" and attached an event listener to it. When the button is clicked, the listener retrieves the data and generates an XML content string based on the selected week. This XML content is then saved as a file in memory using a download link.

This technique allowed us to generate an XML file with temperature details without directly accessing the local file system on the frontend. Instead, we simulated a file download by creating a Blob object in memory and programmatically triggering a download.

### Important notice for task 3 (please reade before)

In addition to generating an XML file with temperature details of the selected week, the given task also required me to display a Vertical Bar Chart based on the same data. However, as it's not possible to directly access the local file system on the frontend, I used a technique to generate the required data without saving it to the disk.

However, instead of saving this XML data to the disk, I read the data directly from the Document object and parsed it to generate the Vertical Bar Chart using a charting library. This allowed me to display the chart without directly accessing the local file system on the frontend, as the data was stored in memory.

In summary, I used a technique to simulate a file download and generate an XML file with temperature data in memory, which allowed me to display a Vertical Bar Chart based on the same data without directly accessing the local file system on the frontend.
