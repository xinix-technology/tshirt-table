# tshirt-table
A split table implementation based on tshirt-scroll

**Available Configuration**

1. freezeRow: 0, // How many row you need to freeze on the top
2. freezeCol: 0, // How many coloumn you need to freeze on the left
3. config: {}, // Configuration
4. data: {}, // Multi Array data
5. gap: 1, // The gap between freeze content to regular content
6. rubber: true, // If you need to add rubber
7. highlight: true, // Highlight the result, turn it into false if it's too slow
8. done: function (data) {} // Callback when the script finish rendering

**How to use**

	$("#table").table();
