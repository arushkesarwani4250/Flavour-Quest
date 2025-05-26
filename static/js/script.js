document.addEventListener('DOMContentLoaded', function() {
    // File Upload Handling
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');

    // Search Functionality
    const searchBtn = document.getElementById('searchBtn');
    const foodSearch = document.getElementById('foodSearch');

    // Food Category Buttons
    const foodItems = document.querySelectorAll('.food-item');

    // Handle file uploads
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                uploadFile(e.target.files[0]);
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                uploadFile(e.dataTransfer.files[0]);
            }
        });
    }

    // Handle recipe search
    if (searchBtn && foodSearch) {
        searchBtn.addEventListener('click', () => {
            const query = foodSearch.value.trim();
            if (query) {
                findRecipe(query);
            }
        });
    }

    // Handle food category clicks
    foodItems.forEach(item => {
        item.addEventListener('click', () => {
            const foodName = item.getAttribute('data-food');
            findRecipe(foodName);
        });
    });

    // If on results page, load data from backend
    if (window.location.pathname.includes('/result')) {
        loadResultData();
    }

    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        showLoading();

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            showResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Upload failed');
        });
    }

    function findRecipe(foodName) {
        showLoading();

        fetch('/find_recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ food_name: foodName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'not_found') {
                alert('Recipe not found');
                return;
            }

            // Format the data to match upload response
            const resultData = {
                food_name: foodName,
                confidence: "100%",
                image: "", // No image for search
                recipe: data.recipe
            };

            showResults(resultData);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Search failed');
        });
    }

    function showLoading() {
        // Implement loading indicator
        console.log("Loading...");
    }

    function showResults(data) {
        // Redirect to results page with data
        sessionStorage.setItem('foodai_results', JSON.stringify(data));
        window.location.href = '/result';
    }

    function loadResultData() {
        const resultData = JSON.parse(sessionStorage.getItem('foodai_results'));
        if (!resultData) {
            window.location.href = '/';
            return;
        }

        // Populate the results page
        document.getElementById('resultFoodName').textContent = resultData.food_name;
        document.getElementById('resultConfidence').textContent = resultData.confidence + ' confidence';

        const ingredientsList = document.getElementById('ingredientsList');
        const instructionsList = document.getElementById('instructionsList');

        // Clear previous results
        ingredientsList.innerHTML = '';
        instructionsList.innerHTML = '';

        // Add ingredients
        resultData.recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });

        // Add instructions
        resultData.recipe.instructions.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            instructionsList.appendChild(li);
        });

        // Set image if available
        if (resultData.image) {
            document.getElementById('resultImage').src = `/static/uploads/${resultData.image}`;
        }
    }
});