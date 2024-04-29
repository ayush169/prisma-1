const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const generateRandomAddress = require("./randomAddr");

const prisma = new PrismaClient();

app.use(express.json());

app.get("/", async (req, res) => {
  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

app.get("/users", async (req, res) => {
  const allUsers = await prisma.user.findMany({
    select: {
      firstName: true,
    },
    where: {
      firstName: {
        startsWith: "a",
      },
    },
  });
  res.json(allUsers);
});

app.post("/", async (req, res) => {
  try {
    const id = uuidv4();
    const newUser = await prisma.user.create({
      data: { id, ...req.body },
    });
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/create", async (req, res) => {
  try {
    const usersWithId = req.body.map((user) => {
      return {
        id: uuidv4(),
        ...user,
      };
    });

    const newUsers = await prisma.user.createMany({
      data: usersWithId,
    });
    res.json(newUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/:id", async (req, res) => {
  const id = req.params.id;
  const newAge = req.body.age;
  const updateUser = await prisma.user.update({
    where: { id },
    data: { age: newAge },
  });
  res.json(updateUser);
});

app.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const deleteUser = await prisma.user.delete({
    where: {
      id,
    },
  });

  res.json(deleteUser);
});

app.post("/house", async (req, res) => {
  try {
    const id = uuidv4();
    const address = generateRandomAddress();
    const newHouse = await prisma.house.create({
      data: { id, address, ...req.body },
    });
    res.json(newHouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all houses
// app.get("/house", async (req, res) => {
//   const allHouse = await prisma.house.findMany({
//     include: {
//       owner: true,
//       builtBy: true,
//     },
//   });
//   res.json(allHouse);
// });
app.get("/house", async (req, res) => {
  const allHouse = await prisma.house.findMany({
    // where: {
    //   owner: {
    //     age: {
    //       gt: 22,
    //     },
    //   },
    //   builtBy: {
    //     age: {
    //       gt: 19,
    //     },
    //   },
    // },
    orderBy: {
      owner: {
        firstName: "asc",
      },
    },
    include: {
      owner: true,
      builtBy: true,
    },
  });
  res.json(allHouse);
});

//get house by house id
app.get("/house/:id", async (req, res) => {
  const id = req.params.id;
  const allHouse = await prisma.house.findUnique({
    where: { id },
    include: {
      owner: true,
      builtBy: true,
    },
  });
  res.json(allHouse);
});

//get house by owner id
app.get("/houseByOwner/:id", async (req, res) => {
  const id = req.params.id;
  const ownerHouse = await prisma.house.findMany({
    where: {
      ownerId: id,
    },
    include: {
      owner: true,
      builtBy: true,
    },
  });
  res.json(ownerHouse);
});

app.listen(3001, () => {
  console.log(`Listening on port: 3001`);
});
