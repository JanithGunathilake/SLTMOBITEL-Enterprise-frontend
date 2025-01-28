import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </Router>
  );
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    designation: "",
    company: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Function to validate mobile number (Sri Lankan format)
  const validateMobileNumber = (number) => {
    const regex = /^(?:\+94|0)?(7\d{8})$/; // Validates Sri Lankan mobile numbers
    return regex.test(number);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate mobile number in real-time
    if (name === "contact") {
      if (!validateMobileNumber(value)) {
        setErrors({ ...errors, contact: "Invalid mobile number" });
      } else {
        setErrors({ ...errors, contact: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate mobile number
    if (!validateMobileNumber(formData.contact)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter a valid Sri Lankan mobile number.",
        confirmButtonColor: "#0752a3",
        iconColor: "#ff4444",
      });
      setLoading(false);
      return;
    }

    // Check if the mobile number is already registered
    try {
      const checkResponse = await axios.post("http://localhost:5000/check-contact", {
        contact: formData.contact,
      });

      if (checkResponse.data.exists) {
        Swal.fire({
          icon: "error",
          title: "Already Registered",
          text: "This mobile number is already registered.",
          confirmButtonColor: "#0752a3",
          iconColor: "#ff4444",
        });
        setLoading(false);
        return;
      }

      // If not registered, proceed with registration
      const response1 = await axios.post("http://localhost:5000/register", formData);
      if (response1.status === 200) {
        const response2 = await axios.post("https://raffledraw.brandcorridor.lk/add-data", {
          gcCode: formData.name, // Name as gcCode
          quantity: formData.contact, // Contact Number as quantity
        });

        if (response2.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Registration and data submission successful!",
            confirmButtonColor: "#4bba41",
            iconColor: "#4bba41",
          }).then(() => {
            navigate("/thank-you");
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred. Please try again.",
        confirmButtonColor: "#0752a3",
        iconColor: "#ff4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0752a3] to-[#00beed] p-4">
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all">
        <img src="/logo.png" alt="Logo" className="mx-auto h-32 mb-8" />
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bba41]"
              required
            />
            <input
              type="tel"
              name="contact"
              placeholder="Contact Number"
              value={formData.contact}
              onChange={handleChange}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bba41] ${
                errors.contact ? "border-red-500" : ""
              }`}
              required
            />
            {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
            <input
              type="text"
              name="designation"
              placeholder="Designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bba41]"
              required
            />
            <input
              type="text"
              name="company"
              placeholder="Company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bba41]"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-Mail Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bba41]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 p-3 bg-[#0752a3] text-white rounded-lg hover:bg-[#4bba41] transition-all duration-300 transform hover:scale-105"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

const ThankYouPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0752a3] to-[#00beed] p-4">
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-2xl w-full max-w-md text-center transform transition-all hover:scale-105">
        <img
          src="/logo.png"
          alt="Logo"
          className="mx-auto h-32 mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-3xl font-bold text-[#0752a3]">Thank You!</h1>
        <p className="mt-4 text-gray-600">Your registration was successful.</p>
      </div>
    </div>
  );
};

export default App;