import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./App.css"; 

function App() {
    const [usn, setUsn] = useState("");
    const [student, setStudent] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const searchStudent = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`http://localhost:5000/students/${usn.toUpperCase()}`);
            setStudent(response.data);
            setError("");
        } catch (err) {
            setStudent(null);
            setError("Student not found");
        } finally {
            setLoading(false);
        }
    };

    // Function to generate PDF
    const downloadPDF = async () => {
        const pdf = new jsPDF("p", "mm", "a4");
        let position = 10;
        const marginX = 10; 
        const contentWidth = 180; // Keeps content from cutting off
    
        // Student Details Header
        pdf.setFillColor(255, 204, 0);
        pdf.rect(0, position, 210, 10, "F");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Student Details", marginX, position + 7);
        position += 15;
    
        // Student Info
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Name: ${student.Name}`, marginX, position);
        pdf.text(`USN: ${student.USN}`, marginX, position + 6);
        pdf.text(`Admission Year: ${student.AdmissionYear}`, marginX, position + 12);
        pdf.text(`Department: ${student.Department}`, marginX, position + 18);
        pdf.text(`Email: ${student.Email}`, marginX, position + 24, { maxWidth: contentWidth });
        position += 30;
    
        if (student.Events.length > 0) {
            // Event Details Header
            pdf.setFillColor(255, 204, 0);
            pdf.rect(0, position, 210, 10, "F");
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text("Event Details", marginX, position + 7);
            position += 15;
    
            for (const [index, event] of student.Events.entries()) {
                if (position + 50 > 280) { // Page break if needed
                    pdf.addPage();
                    position = 10;
                }
    
                pdf.setFontSize(12);
                pdf.setTextColor(0, 0, 0);
                pdf.text(`Event ${index + 1}: ${event.EventName}`, marginX, position);
                pdf.text(`Date: ${event.EventDate}`, marginX, position + 6);
                pdf.text(`Type: ${event.EventType}`, marginX, position + 12);
                pdf.text(`Certificate Details:`, marginX, position + 18);
    
                // Wrap certificate details properly
                let splitDetails = pdf.splitTextToSize(event.CertificateDetails, contentWidth);
                pdf.text(splitDetails, marginX + 5, position + 24);
                position += 24 + (splitDetails.length * 6); // Adjust for text height
    
                // View Certificate Link - Keeps it aligned properly
                if (event.CertificatePhotos !== "Not available") {
                    pdf.setTextColor(0, 0, 255);
                    pdf.textWithLink("View Certificate", marginX, position, { url: event.CertificatePhotos });
                } else {
                    pdf.setTextColor(255, 0, 0);
                    pdf.text("No certificate available", marginX, position);
                }
                position += 10;
            }
        } else {
            pdf.setTextColor(255, 0, 0);
            pdf.text("No events found for this student.", marginX, position);
        }
    
        pdf.save(`${student.USN}_Details.pdf`);
    };
    
    return (
        <div className="container">
            <h1>Search Student by USN</h1>
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="Enter USN" 
                    value={usn} 
                    onChange={(e) => setUsn(e.target.value)} 
                />
                <button onClick={searchStudent}>Search</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {student && (
    <div id="pdf-content">  {/* ✅ Wrap student & event details inside this div */}
        
        {/* Student Details */}
        <div id="student-details">
            <h2>Student Details</h2>
            <p><strong>Name:</strong> {student.Name}</p>
            <p><strong>USN:</strong> {student.USN}</p>
            <p><strong>Admission Year:</strong> {student.AdmissionYear}</p>
            <p><strong>Department:</strong> {student.Department}</p>
            <p><strong>Email:</strong> {student.Email}</p>
        </div>

        {/* Event Details */}
        <div id="event-details">
            <h2>Event Details</h2>
            {student.Events && student.Events.length > 0 ? (
                <div className="events-grid">
                    {student.Events.map((event, index) => (
                        <div key={index} className="event-box">
                            <h4>Event {index + 1}</h4>
                            <p><strong>Name of the Event:</strong> {event.EventName}</p>
                            <p><strong>Date of Event:</strong> {event.EventDate}</p>
                            <p><strong>Type of Event:</strong> {event.EventType}</p>

                            <p><strong>Uploaded Files:</strong> 
                                {event.CertificatePhotos !== "Not available" ? (
                                    <a href={event.CertificatePhotos} target="_blank" rel="noopener noreferrer">View Files</a>
                                ) : "No files available"}
                            </p>

                            <p><strong>Certificate Details:</strong> {event.CertificateDetails}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No events found for this student.</p>
            )}
        </div>
    </div>
)}


            {student && (
                <button className="download-btn" onClick={downloadPDF}>Download PDF</button>
            )}
        </div>
    );
}

export default App;
