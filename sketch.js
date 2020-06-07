let w = 50
let grid;
let cols = 0
let rows = 0

let optimalPath = []

let start = null
let end = null
let currentNode = null

let openSet = []
let closedSet = []

let alreadyVisited = []


function heuristic(a, b) {
    return dist(a.i, a.j, b.i, b.j)
}

function getBestNode(nodes) {
    let minFScore = 0
    let minIndex = 0

    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].fScore < minFScore) {
            minFScore = nodes[i].fScore
            minIndex = i
        }
    }

    return nodes[minIndex]
}

function removeNode(node, nodes) {
    for (let i = nodes.length; i >= 0; i--) {
        if (nodes[i] === node) {
            nodes.splice(i, 1)
        }
    }
}

function findElement(node, nodes) {
    let index = -1

    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i] === node) {
            index = i
        }
    }

    if (index > -1) {
        return nodes[index]
    }

    return null
}

function aStar(start, end, h) {
    let openSet = [start]
    let closedSet = []

    while (openSet.length) {
        currentNode = getBestNode(openSet)

        if (currentNode === end || currentNode.wall) {
            return
        }

        removeNode(currentNode, openSet)
        closedSet.push(currentNode)

        let neighbours = currentNode.neighbours

        for (let i = 0; i < neighbours.length; i++) {
            if (!findElement(neighbours[i], closedSet) && !neighbours[i].wall) {
                let tempGScore = currentNode.gScore + dist(currentNode.i, currentNode.j, neighbours[i].i, neighbours[i].j)

                var newPath = false
                if (findElement(neighbours[i], openSet)) {
                    if (tempGScore < neighbours[i].gScore) {
                        neighbours[i].gScore = tempGScore
                        newPath = true
                    }
                } else {
                    neighbours[i].gScore = tempGScore
                    newPath = true
                    openSet.push(neighbours[i])
                }

                // Yes, it's a better path
                if (newPath) {
                    neighbours[i].cameFrom = currentNode
                    neighbours[i].fScore = neighbours[i].gScore + h(neighbours[i], end)
                }
            }
        }
    }

    return []

}

async function getBestNeighbour(neighbours, end) {

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

async function findPath(current) {
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

function gridNode(i, j, isWall) {
    this.i = i
    this.j = j
    this.wall = isWall
    this.cameFrom = null
    this.gScore = 0
    this.fScore = 0

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
    cols = Math.floor(windowWidth / w)
    rows = Math.floor(windowHeight / w)
    grid = new Array(cols)

    createCanvas(windowWidth, windowHeight)

    for (let i = 0; i < grid.length; i++) {
        grid[i] = new Array(rows)
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j] = new gridNode(i * w + 25, j * w + 25, random(0, 5) > 4)
        }
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j].addNeighbours(i, j)
        }
    }

    start = grid[0][0]
    end = grid[cols - 1][rows - 1]

    openSet.push(start)

}

function draw() {
    background(255)

    if (openSet.length) {
        currentNode = getBestNode(openSet)

        if (currentNode === end || currentNode.wall) {
            noLoop()
            console.log("Done")
        }

        removeNode(currentNode, openSet)
        closedSet.push(currentNode)

        let neighbours = currentNode.neighbours

        for (let i = 0; i < neighbours.length; i++) {
            if (!findElement(neighbours[i], closedSet) && !neighbours[i].wall) {
                let tempGScore = currentNode.gScore + dist(currentNode.i, currentNode.j, neighbours[i].i, neighbours[i].j)

                var newPath = false
                if (findElement(neighbours[i], openSet)) {
                    if (tempGScore < neighbours[i].gScore) {
                        neighbours[i].gScore = tempGScore
                        newPath = true
                    }
                } else {
                    neighbours[i].gScore = tempGScore
                    newPath = true
                    openSet.push(neighbours[i])
                }

                // Yes, it's a better path
                if (newPath) {
                    neighbours[i].cameFrom = currentNode
                    neighbours[i].fScore = neighbours[i].gScore + heuristic(neighbours[i], end)
                }
            }
        }
    } else {
        console.log('no solution')
        noLoop()
    }


    strokeWeight(20)
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

    let temp = currentNode
    optimalPath = [temp]

    while (temp.cameFrom) {
        optimalPath.push(temp.cameFrom)
        temp = temp.cameFrom
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