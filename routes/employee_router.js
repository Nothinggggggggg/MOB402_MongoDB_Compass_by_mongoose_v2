const express = require("express");
const EmployeeModel = require("../models/employee_model");

const router = express.Router();

const Employee = EmployeeModel.EmployeeModel;

// 'page' is global variable (to handle back button to List)
let page = 1;

// #READ
router.get("/list/:page", async (req, res, next) => {
  try {
    // _1-get all employees
    const employees = await Employee.find({}).lean().exec();

    // _2-get all pages
    const pages = [];
    const max = 10;
    const pageCount = Number.isInteger(employees.length / max)
      ? employees.length / max
      : Math.ceil(employees.length / max);
    for (let i = 1; i <= pageCount; i++) {
      pages.push(i);
    }

    // _3-get present page
    page = parseInt(req.params.page);

    // _4-set conditions for page
    if (pageCount == 0) {
      return res.render("home", {
        pageTitle:'Empty',
        favIcon:'/img/icon_read.svg',
        page:page,
        isSearch: true,
      });
    }
    if (page > pageCount) {
      page = pageCount;
    }

    // _5-handle pages
    /*
                not     >   active  >   not
                start       page        end
        */
    let indexToSplit = pages.indexOf(page);
    let start = pages.slice(0, indexToSplit);
    let end = pages.slice(indexToSplit + 1);
    console.log(`${start} > ${page} > ${end}`);

    // _6-get employees at present page
    const employeesPage = await Employee.find({})
      .limit(max)
      .skip(max * (page - 1))
      .lean()
      .exec();

    // _7-render
    return res.render("home", {
      pageTitle: `Employees - Page ${page}`,
      favIcon: "/img/icon_read.svg",
      employeesPage: employeesPage,
      count: employeesPage.length,
      max:max,
      start: start,
      page: page,
      end: end,
      disablePrev: page == 1,
      disableNext: page == pageCount,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/detail/:_id',async (req,res,next)=>{

    try {
        // _1-get employee by id
        const employee = await Employee.findById(req.params._id).lean().exec();

        // _2-render
        return res.render("detail", {
          pageTitle: "Detail",
          favIcon: "/img/icon_detail.svg",
          page: page,
          employee: employee,
        });
    } catch (error) {
        res.status(500).send(error);
    }
})

// #CREATE
router.get("/create", (req, res, next) => {
  res.render("create", {
    pageTitle: "Add new Employee",
    favIcon: "/img/icon_create.svg",
    page: page,
  });
});

router.post("/create", async (req, res, next) => {
  try {
    console.log("req.body", req.body);

    // _1-create new employee
    const salary = !req.body.salary ? 1000 : req.body.salary;
    const age = !req.body.age ? 18 : req.body.age;
    const employee = await Employee.create({
      name: req.body.name,
      age: age,
      salary: salary,
    });

    // _2-success > back to List
    return res.redirect("/employees/list/" + page);
  } catch (error) {
    res.status(500).send(error);
  }
});

// #UPDATE
router.get("/update/:_id", async (req, res, next) => {
  try {
    // _1-get employee need update by id
    const employee = await Employee.findById(req.params._id).lean().exec();

    // _2-render
    return res.render("update", {
      pageTitle: "Update Employee",
      favIcon: "/img/icon_update.svg",
      page: page,
      employee: employee,
    });
  } catch (error) {}
});

router.post("/update/:_id", async (req, res, next) => {
  try {
    console.log("req.body", req.body);

    // _1-update employee by id
    const salary = !req.body.salary ? 1000 : req.body.salary;
    const age = !req.body.age ? 18 : req.body.age;
    const employee = await Employee.findByIdAndUpdate(req.params._id, {
      name: req.body.name,
      age: age,
      salary: salary,
    })
      .lean()
      .exec();

    // _2-success > back to List
    return res.redirect("/employees/list/" + page);
  } catch (error) {
    res.status(500).send(error);
  }
});

// #DELETE
router.get("/delete/:_id", async (req, res, next) => {
  try {
    // _1-delete employee by id
    const employee = await Employee.findByIdAndDelete(req.params._id)
      .lean()
      .exec();

    // _2-success > back to List
    return res.redirect("/employees/list/" + page);
  } catch (error) {
    res.status(500).send(error);
  }
});

// #FIND
router.post("/list_search", async (req, res, next) => {
    console.log('req.body',req.body);

  try {
    // _1-empty search -> back to List
    if(!req.body.name && !req.body.age && !req.body.salary){
        return res.redirect('/employees/list/'+page);
    }

    // _2-filter 
    const employeesPage = await Employee.find({
        name:{
            $regex:req.body.name,
            $options:'i'
        },
        age: !req.body.age?{$gte:0}:{$eq:req.body.age},
        salary: !req.body.salary?{$gte:0}:{$eq:req.body.salary}
    }).lean().exec();

    // _3-render
    return res.render("home", {
      pageTitle: "Search",
      favIcon: "/img/icon_find.svg",
      page: page,
      employeesPage: employeesPage,
      isSearch: true,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

exports.router = router;
