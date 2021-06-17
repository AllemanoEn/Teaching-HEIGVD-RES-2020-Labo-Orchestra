# Teaching-HEIGVD-RES-2020-Labo-Orchestra

## Admin

* **You can work in groups of 2 students**.
* It is up to you if you want to fork this repo, or if you prefer to work in a private repo. However, you have to **use exactly the same directory structure for the validation procedure to work**.
* We expect that you will have more issues and questions than with other labs (because we have a left some questions open on purpose). Please ask your questions on Telegram / Teams, so that everyone in the class can benefit from the discussion.

## Objectives

This lab has 4 objectives:

* The first objective is to **design and implement a simple application protocol on top of UDP**. It will be very similar to the protocol presented during the lecture (where thermometers were publishing temperature events in a multicast group and where a station was listening for these events).

* The second objective is to get familiar with several tools from **the JavaScript ecosystem**. You will implement two simple **Node.js** applications. You will also have to search for and use a couple of **npm modules** (i.e. third-party libraries).

* The third objective is to continue practicing with **Docker**. You will have to create 2 Docker images (they will be very similar to the images presented in class). You will then have to run multiple containers based on these images.

* Last but not least, the fourth objective is to **work with a bit less upfront guidance**, as compared with previous labs. This time, we do not provide a complete webcast to get you started, because we want you to search for information (this is a very important skill that we will increasingly train). Don't worry, we have prepared a fairly detailed list of tasks that will put you on the right track. If you feel a bit overwhelmed at the beginning, make sure to read this document carefully and to find answers to the questions asked in the tables. You will see that the whole thing will become more and more approachable.


## Requirements

In this lab, you will **write 2 small NodeJS applications** and **package them in Docker images**:

* the first app, **Musician**, simulates someone who plays an instrument in an orchestra. When the app is started, it is assigned an instrument (piano, flute, etc.). As long as it is running, every second it will emit a sound (well... simulate the emission of a sound: we are talking about a communication protocol). Of course, the sound depends on the instrument.

* the second app, **Auditor**, simulates someone who listens to the orchestra. This application has two responsibilities. Firstly, it must listen to Musicians and keep track of **active** musicians. A musician is active if it has played a sound during the last 5 seconds. Secondly, it must make this information available to you. Concretely, this means that it should implement a very simple TCP-based protocol.

![image](images/joke.jpg)


### Instruments and sounds

The following table gives you the mapping between instruments and sounds. Please **use exactly the same string values** in your code, so that validation procedures can work.

| Instrument | Sound         |
|------------|---------------|
| `piano`    | `ti-ta-ti`    |
| `trumpet`  | `pouet`       |
| `flute`    | `trulu`       |
| `violin`   | `gzi-gzi`     |
| `drum`     | `boum-boum`   |

### TCP-based protocol to be implemented by the Auditor application

* The auditor should include a TCP server and accept connection requests on port 2205.
* After accepting a connection request, the auditor must send a JSON payload containing the list of <u>active</u> musicians, with the following format (it can be a single line, without indentation):

```
[
  {
  	"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
  	"instrument" : "piano",
  	"activeSince" : "2016-04-27T05:20:50.731Z"
  },
  {
  	"uuid" : "06dbcbeb-c4c8-49ed-ac2a-cd8716cbf2d3",
  	"instrument" : "flute",
  	"activeSince" : "2016-04-27T05:39:03.211Z"
  }
]
```

### What you should be able to do at the end of the lab


You should be able to start an **Auditor** container with the following command:

```
$ docker run -d -p 2205:2205 res/auditor
```

You should be able to connect to your **Auditor** container over TCP and see that there is no active musician.

```
$ telnet IP_ADDRESS_THAT_DEPENDS_ON_YOUR_SETUP 2205
[]
```

You should then be able to start a first **Musician** container with the following command:

```
$ docker run -d res/musician piano
```

After this, you should be able to verify two points. Firstly, if you connect to the TCP interface of your **Auditor** container, you should see that there is now one active musician (you should receive a JSON array with a single element). Secondly, you should be able to use `tcpdump` to monitor the UDP datagrams generated by the **Musician** container.

You should then be able to kill the **Musician** container, wait 5 seconds and connect to the TCP interface of the **Auditor** container. You should see that there is now no active musician (empty array).

You should then be able to start several **Musician** containers with the following commands:

```
$ docker run -d res/musician piano
$ docker run -d res/musician flute
$ docker run -d res/musician flute
$ docker run -d res/musician drum
```
When you connect to the TCP interface of the **Auditor**, you should receive an array of musicians that corresponds to your commands. You should also use `tcpdump` to monitor the UDP trafic in your system.


## Task 1: design the application architecture and protocols

| #  | Topic |
| --- | --- |
|Question | How can we represent the system in an **architecture diagram**, which gives information both about the Docker containers, the communication protocols and the commands? |
| | ![diagram](images/questionDiagram.png) |
|Question | Who is going to **send UDP datagrams** and **when**? |
| | Each musicians sends **UDP datagrams** every **1 seconds** |
|Question | Who is going to **listen for UDP datagrams** and what should happen when a datagram is received? |
| | The auditor listen to the **UDP datagrams** sends from the musicians. Each time the auditor receive a datagram, he update his list of current active musicians. |
|Question | What **payload** should we put in the UDP datagrams? |
| | The instrument's sound and the musician's UUID |
|Question | What **data structures** do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures? |
| | To associate the sounds and the instruments we use a map (associative array). </br> **Sender side :** In the musician map, an instrument is mapped with its sound </br> **Receiver side :** In the auditor map, a sound is mapped with its instrument </br> Those will never be update, so we need to request them each time we want to send the sound associated with the instrument or find the instrument associated with a specific sound. |


## Task 2: implement a "musician" Node.js application

| #  | Topic |
| ---  | --- |
|Question | In a JavaScript program, if we have an object, how can we **serialize it in JSON**? |
| | With the [`JSON.stringify()`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) function |
|Question | What is **npm**?  |
| | npm is the entire package manager for `NodeJS` (the official one)  |
|Question | What is the `npm install` command and what is the purpose of the `--save` flag?  |
| | `npm install` install a specific package that is passed in params </br> `--save` used for adding the insalled package as a dependecy. (No more used since npm 5) |
|Question | How can we use the `https://www.npmjs.com/` web site?  |
| | You can search for a package on this website and simply installed it with a single command line  |
|Question | In JavaScript, how can we **generate a UUID** compliant with RFC4122? |
| | With the `rfc4122` package. And finally by using the `v4f` function |
|Question | In Node.js, how can we execute a function on a **periodic** basis? |
| | With the `setInterval` function that take a function as arguments  |
|Question | In Node.js, how can we **emit UDP datagrams**? |
| | The `dgram` package can do it with `dgram.createSocket('udp4')` to create a socket. Then we used the `send` function on the socket  |
|Question | In Node.js, how can we **access the command line arguments**? |
| | By using the global array `process.argv`  |


## Task 3: package the "musician" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we **define and build our own Docker image**?|
| | As we do in other labs. Create a docker file with the lab specifications and execute the `docker run` command. We also used -t to specify an image name   |
|Question | How can we use the `ENTRYPOINT` statement in our Dockerfile?  |
| | To run a command at a start of a container, the `ENTRYPOINT` statement is used. In this lab, we used it to execute `"node", "/opt/app/app.js"` to run the `app.js` script  |
|Question | After building our Docker image, how do we use it to **run containers**?  |
| | Simply by using the given command line `docker run -d <image_name> <instrument_name>`  |
|Question | How do we get the list of all **running containers**?  |
| | With the command line `docker ps`  |
|Question | How do we **stop/kill** one running container?  |
| | With the command line `docker kill <container_name>`  |
|Question | How can we check that our running containers are effectively sending UDP datagrams?  |
| | We can use something like Wireshark or tcpdump (as it is recommended in the labo restriction)  |


## Task 4: implement an "auditor" Node.js application

| #  | Topic |
| ---  | ---  |
|Question | With Node.js, how can we listen for UDP datagrams in a multicast group? |
| | By using `addMembership` method with a given multicast groupe. In the labo we use `socketUDP.addMembership(protocol.HOSTNAME)`  |
|Question | How can we use the `Map` built-in object introduced in ECMAScript 6 to implement a **dictionary**?  |
| | By using the `Map` constructor with any `Iterable`. For us, the array of instrument/sound definded in our lab |
|Question | How can we use the `Moment.js` npm module to help us with **date manipulations** and formatting?  |
| | For the manipulations, we could use : `const today = moment();` and `today.format()`; </br> For the formatting, we could use : `moment(testDate).format('MM/DD/YYYY');` |
|Question | When and how do we **get rid of inactive players**?  |
| | Inactive musicians are delete when the list of musicians is asked to the auditor |
|Question | How do I implement a **simple TCP server** in Node.js?  |
| | The `net` library can do it with `createServer`. Then we used the `on` function to listen to a `connection` event |


## Task 5: package the "auditor" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we validate that the whole system works, once we have built our Docker image? |
| | This labo provide a `validate.sh` script to be sure that everything is working. If we want to do manual test, the **What you should be able to do at the end of the lab** section can be followed |


## Constraints

Please be careful to adhere to the specifications in this document, and in particular

* the Docker image names
* the names of instruments and their sounds
* the TCP PORT number

Also, we have prepared two directories, where you should place your two `Dockerfile` with their dependent files.

Have a look at the `validate.sh` script located in the top-level directory. This script automates part of the validation process for your implementation (it will gradually be expanded with additional operations and assertions). As soon as you start creating your Docker images (i.e. creating your Dockerfiles), you should try to run it.
