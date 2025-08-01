console.log("✅ Script is working!");

// ✅ Correct Supabase client setup
const { createClient } = supabase;

const supabaseUrl = 'https://seldggywtdjqximurhmc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbGRnZ3l3dGRqcXhpbXVyaG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjA1NDQsImV4cCI6MjA2OTYzNjU0NH0.o_1Ue7oB5jjxBM9UyrMcdklBZyoQGPU9jHzBh5ggp5E';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

let allProperties = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded');
  await loadProperties();

  const toggleFormBtn = document.getElementById('toggleFormBtn');
  const propertyForm = document.getElementById('property-form');

  toggleFormBtn.addEventListener('click', () => {
    propertyForm.classList.toggle('hidden');
  });

  propertyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(propertyForm);
    const newProperty = Object.fromEntries(formData.entries());

    // Fix for Supabase column: Relation (capital R)
    newProperty.Relation = formData.get("relation");
    delete newProperty.relation;

    newProperty.size_ha = parseFloat(newProperty.size_ha);
    newProperty.value = parseFloat(newProperty.value);
    newProperty.created_at = new Date().toISOString();

    console.log("📦 New Property:", newProperty);

    const { error } = await supabaseClient.from('properties').insert([newProperty]);

    if (error) {
      alert('❌ Failed to add property');
      console.error(error);
    } else {
      propertyForm.reset();
      propertyForm.classList.add('hidden');
      await loadProperties();
    }
  });

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allProperties.filter(p =>
      (p.title_no || '').toLowerCase().includes(keyword) ||
      (p.location || '').toLowerCase().includes(keyword)
    );
    renderCards(filtered);
  });
});

async function loadProperties() {
  const { data, error } = await supabaseClient.from('properties').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching properties:', error);
    return;
  }

  allProperties = data;
  renderCards(allProperties);
}

function renderCards(properties) {
  const results = document.getElementById('results');
  results.innerHTML = '';

  if (properties.length === 0) {
    results.innerHTML = '<p class="text-gray-500">No properties found.</p>';
    return;
  }

  properties.forEach(p => {
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded shadow';

    card.innerHTML = `
      <h2 class="text-xl font-semibold mb-2">${p.title_no || 'Untitled'}</h2>
      <p><strong>Location:</strong> ${p.location || 'N/A'}</p>
      <p><strong>Size (Ha):</strong> ${p.size_ha || 'N/A'}</p>
      <p><strong>GPS:</strong> ${p.gps || 'N/A'}</p>
      <p><strong>Value:</strong> ${p.value ? 'KES ' + p.value.toLocaleString() : 'N/A'}</p>
      <p><strong>Valuation Date:</strong> ${p.valuation_date || 'N/A'}</p>
      <p><strong>Relation:</strong> ${p.Relation || 'N/A'}</p>
    `;
    results.appendChild(card);
  });
}
