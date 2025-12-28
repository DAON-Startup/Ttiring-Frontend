import { api } from "@/services/apiClient";

async function testGetAllCategories() {
  try {
    const response = await api.getAllCategories();
    console.log("Fetched Categories:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

testGetAllCategories();
