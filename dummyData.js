const mongoose = require("mongoose");
const Student = require("./models/student.js"); // Ensure Student model is in models/Student.js

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/outpassDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Function to generate random data
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const branches = ["CSE", "ECE", "MECH", "CIVIL", "EEE"];
const dormNumbers = ["A101", "B202", "C303", "D404", "E505"];
const phonePrefix = "86393";
const studentNames = [
    "Aarav Reddy", "Meghana Sharma", "Aditya Verma", "Sneha Patel", "Rohan Iyer", "Priya Nair", "Vikram Singh",
    "Neha Choudhary", "Siddharth Das", "Tanisha Kapoor", "Varun Malhotra", "Sanya Agarwal", "Karthik Rao", "Pooja Mehta",
    "Rajesh Joshi", "Divya Menon", "Aniket Bose", "Swati Tandon", "Manish Khanna", "Suhani Mishra", "Gaurav Tripathi",
    "Ishita Dutta", "Rajat Khandelwal", "Tanya Saxena", "Naveen Bhatia", "Ananya Choudhury", "Harsh Jain", "Simran Kaur",
    "Rahul Sen", "Shruti Pillai", "Abhinav Yadav", "Sonali Chauhan", "Tarun Gupta", "Pallavi Singh", "Yash Goel",
    "Arjun Malhotra", "Ritika Desai", "Mohit Sharma", "Esha Kapoor", "Kunal Mathur", "Siddhi Bansal", "Amitav Sinha",
    "Priyanshi Thakur", "Anshul Saxena", "Nikita Ghosh", "Deepak Vora", "Krishna Pandey", "Aishwarya Iyer", "Vishal Sinha",
    "Tanvi Mahajan", "Rakesh Choudhary", "Snehal Shah", "Prateek Jain", "Asmita Das", "Anirudh Kapoor", "Dhruv Mehta",
    "Rashmi Tripathi", "Karan Ahuja", "Sakshi Gupta", "Nikhil Nair", "Ishaan Dutta", "Madhavi Rao", "Abhishek Sharma",
    "Sanya Bajaj", "Rahul Kulkarni", "Tisha Tiwari", "Neelima Bhatt", "Sourav Choudhury", "Rhea Srivastava", "Kabir Seth",
    "Poonam Saxena", "Arvind Yadav", "Jatin Khurana", "Saloni Mehrotra", "Harshvardhan Sharma", "Kanika Chopra",
    "Samar Singh", "Devika Mukherjee", "Ujjwal Pandey", "Gautam Rajput", "Charu Verma", "Shivangi Jaiswal", "Zubin Daruwala",
    "Meera Subramanian", "Ankit Agarwal", "Laxmi Menon", "Tanishq Deshmukh", "Navya Anand", "Pranav Nambiar", "Veena Pillai",
    "Rudra Narayan", "Mallika Raghavan", "Sandeep Joshi", "Apoorva Naidu", "Parth Saxena", "Vidhi Shah", "Shreyas Reddy",
    "Yukti Gupta", "Aradhya Kapoor", "Kushagra Bansal", "Dhanya Srinivasan", "Varsha Kaushik", "Vivek Maheshwari", "Samiksha Tandon",
    "Shaan Ahuja", "Prateeksha Mishra", "Ashwin Ramesh", "Suhasini Kulkarni", "Mahesh Iyer", "Aayush Khanna", "Devanshi Sharma",
    "Chirag Shetty", "Malini Singh", "Keshav Gopal", "Himanshi Tyagi", "Rahul Chatterjee", "Ritika Batra", "Zoya Naqvi",
    "Rohan Bhardwaj", "Lavanya Rane", "Aakash Pandit", "Ishaani Gupta", "Nitin Desai", "Aparna Joshi", "Shaurya Thakur",
    "Sanya Reddy", "Vibhor Tiwari", "Akshay Anand", "Rohini Swaminathan", "Dheeraj Menon", "Sreeja Murthy", "Saket Mishra",
    "Nandini Bhatt", "Yogesh Patel", "Shraddha Kapoor", "Bhaskar Sharma", "Satish Rao", "Harini Ranganathan", "Neeraj Goenka",
    "Nishant Malhotra", "Avantika Sridhar", "Ravi Teja", "Deepali Chhabra", "Akanksha Varma", "Hemant Wadhwa", "Saurabh Kohli",
    "Juhi Vaidya", "Surya Pratap", "Kanav Arora", "Vaishnavi Nambiar", "Hemali Doshi", "Ravindra Chauhan", "Manoj Batra",
    "Atharv Trivedi", "Sharvani Patil", "Bhavana Iyer", "Lalit Kapoor", "Rajdeep Bhattacharya", "Anamika Roy", "Chetan Nair",
    "Raghav Bhat", "Sarita Sharma", "Jayesh Arvind", "Mahima Prakash", "Navneet Chatterjee", "Krishna Banerjee", "Aditi Kumar",
    "Nakul Verma", "Swastik Tripathi", "Anisha Mehta", "Hardik Goyal", "Bharat Dev", "Saumya Saxena", "Girish Walia",
    "Rahul Negi", "Srishti Gupta", "Bhavik Bansal", "Akhil Narayan", "Tanuja Raj", "Yogita Kothari", "Ravishankar Menon",
    "Meenal Mishra", "Kritika Sharma", "Ayaan Patel", "Arjun Raghav", "Tanmay Mohan", "Radhika Iyer", "Harshit Malhotra",
    "Vimal Taneja", "Anirban Choudhury", "Akshita Chawla", "Sudeep Pradhan", "Sanjay Pillai", "Rohan Krishna", "Naveeta Das",
    "Prachi Kothari", "Zehra Rizvi", "Deepak Tiwari", "Anushka Mathur", "Abhinay Reddy", "Jasmine Ahuja", "Pranjal Saxena",
    "Manasi Joshi", "Riya Trivedi", "Shubham Khera", "Vinod Ramesh", "Shanaya Kapoor", "Niraj Bhardwaj", "Tushar Mittal"
];

// Generate 1,000 students
const students = [];
for (let i = 1; i <= 1000; i++) {
    let idNo = `R21${String(i).padStart(4, "0")}`; // R210001 to R211000

    let usedOutpasses = Math.floor(Math.random() * 5); // Random used outpasses (0 to 4)
    let remainingOutpasses = 10 - usedOutpasses; // Corrected calculation

    students.push({
        idNo,
        name: studentNames[i % studentNames.length],
        branch: getRandomItem(branches),
        year: getRandomItem([1, 2, 3, 4]), // Year 1 to 4
        dormNo: getRandomItem(dormNumbers),
        phoneNumber: `${phonePrefix}${String(i).padStart(5, "0")}`, // Random phone
        totalOutpassesAllowed: 10,
        outpassesUsed: usedOutpasses, // ✅ Defined first
        outpassesRemaining: remainingOutpasses // ✅ Now it correctly references 'usedOutpasses'
    });
}

// Insert students into MongoDB
Student.insertMany(students)
    .then(() => {
        console.log("Students added successfully!");
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("Error inserting students:", err);
        mongoose.connection.close();
    });
