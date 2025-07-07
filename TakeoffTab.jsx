const handleStructuredScan = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
   const response = await fetch("http://127.0.0.1:8000/api/parse-spec", {

      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("🧠 Parsed structured data:", data.parsed);

    // Optionally update state or dispatch to store:
    // setParsedStructuredData(data.parsed);
    // or show results in UI
  } catch (error) {
    console.error("❌ Structured parsing failed:", error);
  }
};
