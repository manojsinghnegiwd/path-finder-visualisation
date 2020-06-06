let w = 100 
let grid;
let cols = Math.floor(850/w)
let rows = Math.floor(850/w)

let optimalPath = []

let start = null
let end = null
let currentNode = null

let alreadyVisited = []

async function getBestNeighbour (neighbours, end) {

    await new Promise(resolve => setTimeout(resolve, 100))

    let validNeighbours = []

    for (let i = 0; i < neighbours.length; i++) {
        if (!neighbours[i].wall) {
            validNeighbours.push(neighbours[i])
        }
    }

    let distanceMap = []

    for (let i = 0; i < validNeighbours.length; i++) {
        distanceMap.push(dist(validNeighbours[i].i, validNeighbours[i].j, end.i, end.j))
    }

    let minIndex = 0;
    let minValue = distanceMap[minIndex];

    for (let i = 0; i < distanceMap.length; i++) {
        if (minValue > distanceMap[i]) {
            minValue = distanceMap[i]
            minIndex = i
        }
    }

    return validNeighbours[minIndex]
}

async function findPath (current) {
    currentNode = current
    
    if (!current) {
        return
    }

    if (end === start) {
        return
    }

    if (end === current) {
        optimalPath.push(current)
        return
    }

    alreadyVisited.push(current)
    optimalPath.push(current)

    let bestNeighbour = await getBestNeighbour(current.neighbours, end)

    await findPath(bestNeighbour)   
}

function gridNode (i, j, isWall) {
    this.i = i
    this.j = j
    this.wall = isWall

    this.neighbours = []

    let self = this

    this.addNeighbours = function (i, j) {

        let iGrid = {
            start: i - 1,
            end: i + 1
        }

        let jGrid = {
            start: j - 1,
            end: j + 1
        }

        if (iGrid.start < 0) {
            iGrid.start = 0
        }

        if (jGrid.start < 0) {
            jGrid.start = 0
        }

        if (iGrid.end > cols - 1) {
            iGrid.end = cols - 1
        }

        if (jGrid.end > rows - 1) {
            jGrid.end = rows - 1
        }

        for (let iCounter = iGrid.start; iCounter <= iGrid.end; iCounter++) {
            for (let jCounter = jGrid.start; jCounter <= jGrid.end; jCounter++) {
                if (iCounter === i && jCounter === j) {
                    continue
                }

                if (grid[iCounter][jCounter]) {
                    self.neighbours.push(grid[iCounter][jCounter])
                }
            }
        }
    }
}

function setup() {
    createCanvas(850, 850)
    grid = new Array(cols)

    for (let i = 0; i < grid.length; i++) {
        grid[i] = new Array(rows)
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j] = new gridNode(i*w + 25, j*w + 25, random(0, 5) > 4)
        }
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j].addNeighbours(i, j)
        }
    }

    start = grid[0][0]
    end = grid[cols - 1][rows - 1]
}

function draw() {
    background(255)

    if (currentNode !== end) {
        findPath(start)
    }

    strokeWeight(5)
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const node = grid[i][j]
            if (node.wall) {
                stroke(255, 0, 0);
            } else {
                stroke(255);
            }
            point(node.i, node.j)
        }
    }

    stroke(0);
    strokeWeight(5)
    noFill()
    beginShape();
    for (let i = 0; i < optimalPath.length; i++) {
        vertex(optimalPath[i].i, optimalPath[i].j);
    }
    endShape();
}