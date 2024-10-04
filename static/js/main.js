document.addEventListener('DOMContentLoaded', () => {
    // Handle upload form submission
    document.getElementById('upload-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.redirect) {
                showSection('analyze');
                populateColumns(data.columns);
            } else if (data.error) {
                showError(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred during upload');
        }
    });

    // Handle analyze form submission
    document.getElementById('analyze-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
    
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
    
            // Create progress bar
            const progressBar = createProgressBar();
            document.getElementById('results').innerHTML = '';
            document.getElementById('results').appendChild(progressBar);
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        if (data.progress !== undefined) {
                            updateProgressBar(progressBar, data.progress);
                        } else if (data.plots && data.correlations) {
                            // Display the results using the displayResults function
                            displayResults(data);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred during analysis');
        }
    });
    
    // Handle train form submission
    document.getElementById('train-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/train', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData)),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const results = await response.json();
            if (results.error) {
                showError(results.error);
            } else {
                displayTrainingResults(results);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred during training');
        }
    });

    // Handle sample prediction form submission
    document.getElementById('sample-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData,
            });

            const sampleResults = await response.json();
            if (sampleResults.error) {
                showError(sampleResults.error);
            } else {
                displaySampleResults(sampleResults);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('An error occurred during prediction');
        }
    });

    // Sync range input with number input for train-test ratio
    const ratioRange = document.getElementById('train-test-ratio');
    const ratioNumber = document.getElementById('train-test-ratio-value');
    ratioRange.addEventListener('input', () => {
        ratioNumber.value = ratioRange.value;
    });
    ratioNumber.addEventListener('input', () => {
        ratioRange.value = ratioNumber.value;
    });

    // Handle "Select All Features" button
    document.getElementById('select-all-features').addEventListener('click', () => {
        const targetValue = document.getElementById('target').value;
        document.querySelectorAll('.feature-checkbox').forEach(checkbox => {
            if (checkbox.value !== targetValue) {
                checkbox.checked = true;
            }
        });
    });

    // Handle target selection changes
    document.getElementById('target').addEventListener('change', (event) => {
        const targetValue = event.target.value;
        document.querySelectorAll('.feature-checkbox').forEach(checkbox => {
            checkbox.disabled = checkbox.value === targetValue;
            if (checkbox.disabled) {
                checkbox.checked = false;
            }
        });
    });
});

function showSection(sectionId) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function populateColumns(columns) {
    const targetSelect = document.getElementById('target');
    const featuresDiv = document.getElementById('features');
    
    targetSelect.innerHTML = '';
    featuresDiv.innerHTML = '';
    
    columns.forEach(column => {
        const option = document.createElement('option');
        option.value = column.name;
        option.textContent = `${column.name} (${column.dtype})`;
        targetSelect.appendChild(option);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'features';
        checkbox.value = column.name;
        checkbox.id = `feature-${column.name}`;
        checkbox.classList.add('feature-checkbox');
        
        const label = document.createElement('label');
        label.htmlFor = `feature-${column.name}`;
        label.textContent = `${column.name} (${column.dtype})`;
        
        const div = document.createElement('div');
        div.appendChild(checkbox);
        div.appendChild(label);
        featuresDiv.appendChild(div);
    });

    // Trigger the change event to set initial state
    targetSelect.dispatchEvent(new Event('change'));
}

function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700';
    const progressBarFill = document.createElement('div');
    progressBarFill.className = 'bg-blue-600 h-2.5 rounded-full';
    progressBarFill.style.width = '0%';
    progressBar.appendChild(progressBarFill);
    return progressBar;
}

function updateProgressBar(progressBar, progress) {
    progressBar.querySelector('div').style.width = `${progress}%`;
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    // Display "Most Indicative Variables"
    const indicativeVarsDiv = document.createElement('div');
    indicativeVarsDiv.innerHTML = '<h3 class="text-xl font-semibold mb-2">Most Indicative Variables</h3>';
    const indicativeVarsList = document.createElement('ol');
    data.correlations.forEach(corr => {
        const li = document.createElement('li');
        li.textContent = `${corr.feature}: ${corr.correlation.toFixed(4)}`;
        indicativeVarsList.appendChild(li);
    });
    indicativeVarsDiv.appendChild(indicativeVarsList);
    resultsDiv.appendChild(indicativeVarsDiv);

    // Display plots
    data.plots.forEach((plot, index) => {
        const plotDiv = document.createElement('div');
        plotDiv.innerHTML = `
            <img src="data:image/png;base64,${plot}" alt="Plot ${index + 1}">
            <p>${data.correlations[index].feature}: ${data.correlations[index].correlation.toFixed(4)}</p>
        `;
        resultsDiv.appendChild(plotDiv);
    });
}

function displayTrainingResults(results) {
    const trainResultsDiv = document.getElementById('train-results');
    trainResultsDiv.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">Training Results:</h3>
        <p>Train Score: ${results.train_score.toFixed(4)}</p>
        <p>Test Score: ${results.test_score.toFixed(4)}</p>
        <p>Train MSE: ${results.train_mse.toFixed(4)}</p>
        <p>Test MSE: ${results.test_mse.toFixed(4)}</p>
        <p>Train MAE: ${results.train_mae.toFixed(4)}</p>
        <p>Test MAE: ${results.test_mae.toFixed(4)}</p>
        <p>Preprocessed Shape: ${results.preprocessed_shape.join(' x ')}</p>
    `;
}

function displaySampleResults(results) {
    const sampleResultsDiv = document.getElementById('sample-results');
    sampleResultsDiv.innerHTML = '<h3 class="text-xl font-semibold mb-2">Sample Prediction Results:</h3>';
    
    const table = document.createElement('table');
    table.className = 'w-full text-sm text-left text-gray-500 dark:text-gray-400';
    table.innerHTML = `
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">Actual</th>
                <th scope="col" class="px-6 py-3">Predicted</th>
                <th scope="col" class="px-6 py-3">Error</th>
            </tr>
        </thead>
        <tbody>
            ${results.results.map(result => `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4">${result.actual.toFixed(4)}</td>
                    <td class="px-6 py-4">${result.predicted.toFixed(4)}</td>
                    <td class="px-6 py-4">${result.error.toFixed(4)}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    sampleResultsDiv.appendChild(table);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline">${message}</span>
    `;
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    // Remove the error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
