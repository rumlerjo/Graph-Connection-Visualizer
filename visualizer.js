//TODO: Add docstrings for all functions to help linter

function roundDecimal(num, places) {
    return Math.round((num + Number.EPSILON) * Math.pow(10, places)) / Math.pow(10, places)
}

/**
 * A utility class for storing 2 values. Mutable.
 */
class Pair {
    /**
     *
     * @param {any} val1 First value of the pair
     * @param {any} val2 Second value of the pair
     */
    constructor(val1, val2) {
        this.first = val1;
        this.second = val2;
    }
}

/**
 * A node to visualize
 */
class VisualizerNode {
    /**
     *
     * @param {CanvasRenderingContext2D} ctx Context of the canvas
     * @param {Pair} position Position of the node
     * @param {String} name Name/ID to display for the node
     */
    constructor(ctx, position, name) {
        this.position = position;
        this.name = name;
        this.ctx = ctx;
        // array of connections
        this.sourceFor = new Array();
        // array of nodes this is connected to; prevent from connecting a second time
        this.connectedTo = new Array();
    }

    /**
     * Display the node
     * @param {number} scale display scale
     * @param {number} xOffset x offset to normalize x coordinate
     * @param {number} yOffset y offset to normalize y coordinate
     */
    display(scale = 1, xOffset = 0, yOffset = 0) {
        let fontSize = 15 * scale;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.beginPath();

        let radius = 30 * scale;
        // position should be a pair, i should learn typescript
        let x = this.position.first * scale;
        let y = this.position.second * scale;
        this.ctx.arc(x - xOffset * scale, y - yOffset * scale, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "rgba(207, 102, 156, 1)";
        this.ctx.strokeStyle = "rgba(88, 88, 88, 1)";
        this.ctx.fill();
        this.ctx.lineWidth = 3 * scale;
        this.ctx.stroke();

        this.ctx.fillStyle = "rgba(88, 88, 88, 1)";
        this.ctx.fillText(this.name, x - xOffset * scale, y - yOffset * scale);

        this.ctx.closePath();
    }

    /**
     * Set the position in virtual coordinate system
     * @param {number} newX new x coordinate
     * @param {*} newY new y coordinate
     */
    setPosition(newX, newY) {
        this.position.first = newX;
        this.position.second = newY;
    }

    /**
     * Get this node's x coordinate
     * @returns {number} x coordinate
     */
    getX() {
        return this.position.first;
    }

    /**
     * Get this node's y coordinate
     * @returns {number} y coordinate
     */
    getY() {
        return this.position.second;
    }

    /**
     * Test for mouse collision
     * @param {Pair} position position mouse clicked at
     * @param {number} xOffset x offset to normalize x coordinate
     * @param {number} yOffset y offset to normalize y coordinate
     * @param {number} scale display scale
     * @returns {boolean} true if collision false otherwise
     */
    testHit(position, xOffset, yOffset, scale = 1) {
        let scaledRadius = scale * 30;

        // should I add radius and scale as class attributes?

        let adjustedX = (position.first) + (xOffset * scale);
        let adjustedY = (position.second) + (yOffset * scale);

        let x = this.getX() * scale;
        let y = this.getY() * scale;

        let xBoundLeft = x - scaledRadius;
        let xBoundRight = x + scaledRadius;
        let yBoundTop = y - scaledRadius;
        let yBoundBottom = y + scaledRadius;


        if (xBoundLeft <= adjustedX && adjustedX <= xBoundRight && yBoundTop <= adjustedY && adjustedY <= yBoundBottom) {
            console.log("hit", this);
            return true;
        }
        return false;
    }

    /**
     * Check if this node is connected to another
     * @param {VisualizerNode} node node to check for
     * @returns {boolean} true if connected false otherwise
     */
    isConnectedTo(node) {
        if (this.connectedTo.includes(node) || node.connectedTo.includes(this)) {
            return true;
        }
        return false;
    }

    getConnections() {
        return this.sourceFor;
    }

    removeAsSourceConnection(toRemove) {
        let removeIdx = this.sourceFor.indexOf(toRemove);
        if (removeIdx != undefined) {
            this.sourceFor.splice(removeIdx, 1);
        }
    }

    /**
     * Connect this node to another
     * @param {VisualizerNode} toConnect node to connect to
     * @returns {Connection} the connection that was made or null
     */
    addAsSourceConnection(toConnect) {
        if (!this.isConnectedTo(toConnect)) {
            let connection = new Connection(this.ctx, this, toConnect);
            this.sourceFor.push(connection);
            this.connectedTo.push(toConnect);
            toConnect.connectedTo.push(this);
            return connection;
        }
        return null;
    }
}

/**
 * Represents a connection
 */
class Connection {
    /**
     * @param {CanvasRenderingContext2D} ctx Canvas context for drawing
     * @param {VisualizerNode} node1 Source node for the connection
     * @param {VisualizerNode} node2 Destination node for the connection
     */
    constructor(ctx, node1, node2) {
        this.ctx = ctx;
        this.connect = new Pair(node1, node2);
    }

    /**
     *
     * @returns {VisualizerNode} source node for connection
     */
    source() {
        return this.connect.first;
    }

    /**
     *
     * @returns {VisualizerNode} destination node for connection
     */
    destination() {
        return this.connect.second;
    }

    display(xOffset, yOffset, scale = 1) {
        this.ctx.lineWidth = 2 * scale;
        this.ctx.strokeStyle = "black";

        xOffset = xOffset * scale;
        yOffset = yOffset * scale;

        let node1X = this.connect.first.position.first * scale - xOffset;
        let node1Y = this.connect.first.position.second * scale - yOffset;
        let node2X = this.connect.second.position.first * scale - xOffset;
        let node2Y = this.connect.second.position.second * scale - yOffset;

        this.ctx.beginPath();

        this.ctx.moveTo(node1X, node1Y);
        this.ctx.lineTo(node2X, node2Y);

        this.ctx.stroke();

        this.ctx.closePath();
    }
}

/**
 * The driving visualizer class
 */
class Visualizer {
    /**
     *
     * @param {HTMLCanvasElement} canvas The canvas to visualize on
     * @param {Number} scale The scale of the visualization
     */
    constructor(canvas, scale = 1) {
        if (!canvas) {
            throw new Error("no canvas provided");
        }

        this.canvas = canvas;

        if (!this.canvas.getContext) {
            throw new Error("canvas has no context");
        }

        this.ctx = this.canvas.getContext("2d");

        // position from the center
        this.currentPosition = new Pair(0, 0);

        this.scale = scale;

        /** @type {Array<VisualizerNode>} */
        this.nodes = new Array();

        /** @type {Array<Connection>} */
        this.connections = new Array();
    }

    addEventListener(name, callback) {
        this.canvas.addEventListener(name, callback);
    }

    addVisualizerNode(position, name) {
        this.nodes.push(new VisualizerNode(this.ctx, position, name))
    }

    toCSV() {
        /** @type {Map<String, Array<String>} */
        let dataMap = new Map();

        this.connections.forEach(connection => {
            let arrSource = dataMap.get(connection.source().name);
            let arrDest = dataMap.get(connection.destination().name);
            if (!arrSource) {
                dataMap.set(connection.source().name, new Array());
                arrSource = dataMap.get(connection.source().name);
            }
            arrSource.push(connection.destination().name);

            if (!arrDest) {
                dataMap.set(connection.destination().name, new Array());
                arrDest = dataMap.get(connection.destination().name);
            }
            arrDest.push(connection.source().name);
        });

        let CSVString = new String();

        dataMap.forEach (
            /**
            * @param {Array<String>} value
            * @param {String} key
            */
            function(value, key) {
                let row = key + "," + value.join(",");
                CSVString += row + "\n";
            }
        );

        return CSVString;
    }

    getPosition() {
        return this.currentPosition;
    }

    setPosition(newX, newY) {
        this.currentPosition.first = newX;
        this.currentPosition.second = newY;
    }

    getX() {
        return this.currentPosition.first;
    }

    getY() {
        return this.currentPosition.second;
    }

    /**
     * Check whether a node is currently on the display
     * @param {VisualizerNode} node VisualizerNode to check display range for
     * @returns {boolean} true if in range else false
     */
    isInDisplay(node) {
        let scaledRadius = this.scale * 30;
        let currentLeft = this.currentPosition.first;
        let currentRight = currentLeft + (this.canvas.width / this.scale);
        let currentTop = this.currentPosition.second;
        let currentBottom = currentTop + (this.canvas.height / this.scale);

        let nodeX = node.position.first;
        let nodeY = node.position.second;

        if (currentLeft <= nodeX + scaledRadius && nodeX - scaledRadius <= currentRight
            && currentTop <= nodeY + scaledRadius && nodeY - scaledRadius <= currentBottom) {
            return true;
        }
        return false;
    }

    /**
     *
     * @param {VisualizerNode} node1
     * @param {VisualizerNode} node2
     */
    addConnection(node1, node2) {
        let newConnection = node1.addAsSourceConnection(node2);
        if (newConnection) {
            this.connections.push(newConnection);
        }
    }

    /**
     * Remove all connections from a node
     * @param {VisualizerNode} node
     */
    removeConnectionsFor(node) {
        let toRemove = new Array();
        for (let i = 0; i < this.connections.length; i++) {
            let connection = this.connections[i];
            if (connection.source() == node || connection.destination() ==  node) {
                if (node != connection.source()) {
                    connection.source().removeAsSourceConnection(node);
                } else {
                    node.removeAsSourceConnection(connection.destination());
                }
                toRemove.push(connection);
            }
        }
        toRemove.forEach(connection => {
            let connIdx = this.connections.indexOf(connection);
            this.connections.splice(connIdx, 1);
        });
    }

    setScale(newScale) {
        this.scale = newScale;
    }

    draw() {
        // try to align the width of the canvas with the navbar's width, otherwise hardcode a percentage
        let menuTemplate = document.querySelector("#menu-draw");
        let navBar = document.querySelector("#menu");
        if (menuTemplate && navBar) {
            this.canvas.width = menuTemplate.scrollWidth * 6 + ((navBar.scrollWidth *.02) * 4.25);
        } else {
            this.canvas.width = window.innerWidth * .9725;
        }
        this.canvas.height = window.innerHeight * .85;

        this.canvas.style.marginTop = ".5%";

        this.canvas.style.borderStyle = "solid";
        this.canvas.style.borderWidth = "thick";
        this.canvas.style.borderColor = "black";

        let currentLeft = this.currentPosition.first;
        let currentTop = this.currentPosition.second;

        this.connections.forEach(connection => {
            let node1 = connection.connect.first;
            let node2 = connection.connect.second;
            if (this.isInDisplay(node1) && this.isInDisplay(node2)) {
                connection.display(currentLeft, currentTop, this.scale);
            }
        });

        this.nodes.forEach(node => {
            if (this.isInDisplay(node)) {
                node.display(this.scale, currentLeft, currentTop);
            }
        });

        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "bottom";
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();

        this.ctx.moveTo(5, 5);
        this.ctx.lineTo(5, 40);
        this.ctx.stroke();

        this.ctx.moveTo(5, 5);
        this.ctx.lineTo(40, 5);
        this.ctx.stroke();

        let fontSize = 15;
        this.ctx.font = `${fontSize}px Arial`;

        let xCoord = `X: ${roundDecimal(this.getX(), 2)}`;
        let yCoord = `Y: ${roundDecimal(this.getY(), 2)}`;
        this.ctx.fillText(xCoord, 45, 17);
        this.ctx.fillText(yCoord, 2, 60);
        let zoom = `Display scale: ${roundDecimal(this.scale, 1)}`;
        this.ctx.fillText(zoom, 2, 80);

        this.ctx.closePath();
    }

    /**
     * Test whether the mouse collides with any nodes on screen
     * @param {Pair} position x and y coordinates of mouse click
     * @returns {VisualizerNode} first node that mouse collides with (top if stacked)
     */
    testHit(position) {
        let toReturn = null;
        // should return whatever is on the top since we reversed it
        this.nodes.reverse();
        this.nodes.every(node => {
            if (node.testHit(position, this.getX(), this.getY(), this.scale)) {
                toReturn = node;
                return false;
            }
            return true;
        });
        // reverse it again so that it is back in the original order
        this.nodes.reverse();
        return toReturn;
    }
}

// from https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return new Pair(x, y);
}

// wait until HTML content is loaded before we start manipulating it.
document.addEventListener("DOMContentLoaded", () => {
    var visualizer = new Visualizer(document.getElementById("main"));
    var movingItem = false;
    var connecting = false;
    var deleting = false;
    var dragging = false;
    var placing = false;
    var navBar = document.getElementById("menu");
    var drawOption = document.getElementById("menu-draw");
    var connectOption = document.getElementById("menu-connect");
    var moveVisualizerNodeOption = document.getElementById("menu-move-node");
    var deleteOption = document.getElementById("menu-delete");
    var saveAsHTMLOption = document.getElementById("menu-save-html");
    var saveAsCSVOption = document.getElementById("menu-save-csv");
    var optionsArray = [drawOption, connectOption, moveVisualizerNodeOption, deleteOption, saveAsHTMLOption, saveAsCSVOption];

    // the last position our mouse was dragged at (in this case, )
    var lastDraggingPosition = new Pair(0, 0);
    // the node that is being dragged
    var draggingVisualizerNode = null;
    // if we are connecting up nodes, this is the first.
    var connectionSource = null

    function clearOptions() {
        movingItem = false;
        connecting = false;
        deleting = false;
        dragging = false;
        placing = false;
        draggingVisualizerNode = null;
        connectionSource = null;
        optionsArray.forEach(item => {
            item.style.backgroundColor = "dimgray";
        });
    }

    visualizer.draw();

    // draw the visualizer to adjust with the current screen bounds
    window.addEventListener("resize", event => {
        visualizer.draw();
    });

    // if the mouse leaves the canvas stop dragging
    visualizer.addEventListener("mouseleave", event => {
        dragging = false;
        visualizer.canvas.style.cursor = "default";
    });

    // draw menu option click logic
    drawOption.addEventListener("click", (event) => {
        if (!placing) {
            clearOptions();
        }
        placing = !placing;
        if (placing) {
            drawOption.style.backgroundColor = "lightgray";
        } else {
            drawOption.style.backgroundColor = "dimgray";
        }
    });

    // draw menu option hover entry logic
    drawOption.addEventListener("mouseover", (event) =>{
        drawOption.style.cursor = "pointer";
        if (!placing) {
            drawOption.style.backgroundColor = "lightgray";
        }
    });

    // draw menu option hover exit logic
    drawOption.addEventListener("mouseleave", (event) => {
        drawOption.style.cursor = "default";
        if (!placing) {
            drawOption.style.backgroundColor = "dimgray";
        }
    });

    // move node menu option click logic
    moveVisualizerNodeOption.addEventListener("click", (event) => {
        if (!movingItem) {
            clearOptions();
        }
        movingItem = !movingItem;
        if (movingItem) {
            moveVisualizerNodeOption.style.backgroundColor = "lightgray";
        } else {
            moveVisualizerNodeOption.style.backgroundColor = "dimgray";
        }
    });

    // move node option hover entry logic
    moveVisualizerNodeOption.addEventListener("mouseover", (event) => {
        moveVisualizerNodeOption.style.cursor = "pointer";
        if (!movingItem) {
            moveVisualizerNodeOption.style.backgroundColor = "lightgray";
        }
    });

    // move node option hover exit logic
    moveVisualizerNodeOption.addEventListener("mouseleave", (event) => {
        moveVisualizerNodeOption.style.cursor = "default";
        if (!movingItem) {
            moveVisualizerNodeOption.style.backgroundColor = "dimgray";
        }
    });

    // connect nodes menu option click logic
    connectOption.addEventListener("click", (event) => {
        if (!connecting) {
            clearOptions();
        }
        connecting = !connecting;
        connectionSource = null;
        if (connecting) {
            connectOption.style.backgroundColor = "lightgray";
        } else {
            connectOption.style.backgroundColor = "dimgray";
        }
    });

    // connect nodes option hover entry logic
    connectOption.addEventListener("mouseover", (event) => {
        connectOption.style.cursor = "pointer";
        if (!connecting) {
            connectOption.style.backgroundColor = "lightgray";
        }
    });

    // connect nodes option hover exit logic
    connectOption.addEventListener("mouseleave", (event) => {
        connectOption.style.cursor = "default";
        if (!connecting) {
            connectOption.style.backgroundColor = "dimgray";
        }
    });

    // delete node menu option click logic
    deleteOption.addEventListener("click", (event) => {
        if (!deleting) {
            clearOptions();
        }
        deleting = !deleting;
        if (deleting) {
            deleteOption.style.backgroundColor = "lightgray";
        } else {
            deleteOption.style.backgroundColor = "dimgray";
        }
    });

    // delete node option hover entry logic
    deleteOption.addEventListener("mouseover", (event) => {
        deleteOption.style.cursor = "pointer";
        if (!deleting) {
            deleteOption.style.backgroundColor = "lightgray";
        }
    });

    // delete node option hover exit logic
    deleteOption.addEventListener("mouseleave", (event) => {
        deleteOption.style.cursor = "default";
        if (!deleting) {
            deleteOption.style.backgroundColor = "dimgray";
        }
    });

    // save graph as CSV click logic (save CSV file)
    saveAsCSVOption.addEventListener("click", event => {
        /** @type {HTMLLinkElement} */
        let csvButton = document.createElement('a');
        csvButton.href = 'data:text/csv;charset=utf-8,' + encodeURI(visualizer.toCSV());

        csvButton.download = "GraphData.csv";
        csvButton.click();
        delete csvButton;
    });

    // save graph as CSV option hover entry logic
    saveAsCSVOption.addEventListener("mouseover", (event) => {
        saveAsCSVOption.style.cursor = "pointer";
        saveAsCSVOption.style.backgroundColor = "lightgray";
    });

    // save graph as CSV option hover exit logic
    saveAsCSVOption.addEventListener("mouseleave", (event) => {
        saveAsCSVOption.style.cursor = "default";
        saveAsCSVOption.style.backgroundColor = "dimgray";
    });

    visualizer.addEventListener("mousedown", event => {
        event.cancelBubble = true;
        event.stopPropagation();
        dragging = true;
        lastDraggingPosition = getCursorPosition(visualizer.canvas, event);
        if (movingItem) {
            let hit = visualizer.testHit(getCursorPosition(visualizer.canvas, event));
            if (hit) {
                draggingVisualizerNode = hit;
                visualizer.canvas.style.cursor = "grab";
                let movingIdx = visualizer.nodes.indexOf(hit);
                if (movingIdx != null) {
                    visualizer.nodes.splice(movingIdx, 1);
                    visualizer.nodes.push(draggingVisualizerNode);
                }
            }
        } else if (!placing && !connecting && !deleting && !movingItem) {
            visualizer.canvas.style.cursor = "move";
        }
        visualizer.draw();
    });

    visualizer.addEventListener("mouseup", event => {
        dragging = false;
        draggingVisualizerNode = null;
        visualizer.canvas.style.cursor = "default";
    });

    visualizer.addEventListener("mousemove", event => {
        event.cancelBubble = true;
        event.stopPropagation();
        if (dragging) {
            if (!placing && !connecting && !deleting && !movingItem) {
                let newPosition = getCursorPosition(visualizer.canvas, event);
                visualizer.canvas.style.cursor = "move";

                let diffX = newPosition.first - lastDraggingPosition.first;
                let diffY = newPosition.second - lastDraggingPosition.second;

                lastDraggingPosition = newPosition;

                let newX = visualizer.getX() - (diffX / visualizer.scale);
                let newY = visualizer.getY() - (diffY / visualizer.scale);

                visualizer.setPosition(newX, newY);
            } else if (!placing && !connecting && !deleting && movingItem && draggingVisualizerNode) {
                let newPosition = getCursorPosition(visualizer.canvas, event);
                let xOffset = visualizer.getX() / visualizer.scale;
                let yOffset = visualizer.getY() / visualizer.scale;
                let newX = newPosition.first / visualizer.scale + xOffset;
                let newY = newPosition.second / visualizer.scale + yOffset;
                draggingVisualizerNode.setPosition(newX, newY);
            }
            visualizer.draw();
        }
    });

    visualizer.addEventListener("mouseover", event => {
        if (placing) {
            visualizer.canvas.style.cursor = "crosshair";
        }
    });

    visualizer.addEventListener("click", event => {
        let hit = visualizer.testHit(getCursorPosition(visualizer.canvas, event));
        if (placing) {
            let name = window.prompt("Enter an ID for the node", (visualizer.nodes.length + 1).toString());
            if (!name) {
                return;
            }
            let offset = visualizer.currentPosition;
            let clickPos = getCursorPosition(visualizer.canvas, event);
            let position = new Pair((clickPos.first / visualizer.scale) +
            (offset.first / visualizer.scale), (clickPos.second / visualizer.scale) + (offset.second / visualizer.scale))
            visualizer.addVisualizerNode(position, name);
            clearOptions();
            visualizer.draw();
        } else if (connecting) {
            if (!connectionSource) {
                if (hit) {
                    connectionSource = hit;
                }
            } else {
                if (hit) {
                    visualizer.addConnection(connectionSource, hit);
                    clearOptions();
                    visualizer.draw();
                }
            }
        } else if (deleting) {
            console.log("deleting");
            if (hit) {
                let hitIdx = visualizer.nodes.indexOf(hit);
                if (hitIdx != undefined) {
                    console.log("in!");
                    visualizer.removeConnectionsFor(hit);
                    visualizer.nodes.splice(hitIdx, 1);
                    visualizer.draw();
                }
            }
        }
    });

    visualizer.addEventListener("wheel", event => {
        event.cancelBubble = true;
        event.stopPropagation();
        // this is definitely buggy
        if (!placing && !connecting && !deleting && !movingItem) {
            if (event.deltaY < 0) {
                if (visualizer.scale < 2) {
                    visualizer.setScale(visualizer.scale + .1);
                }
            } else if (event.deltaY > 0) {
                if (visualizer.scale > .2) {
                    visualizer.setScale(visualizer.scale - .1);
                }
            }
            visualizer.draw();
        }
    });
});
