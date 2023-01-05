//TODO: Add docstrings for all functions to help linter

/**
 * A utility class for storing 2 value tuples.
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
class Node {
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
    }

    display(scale = 1, xOffset = 0, yOffset = 0) {
        let fontSize = 15 * scale;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.ctx.beginPath();

        let radius = 30 * scale;
        // position should be a pair, i should learn typescript
        let x = this.position.first;
        let y = this.position.second;
        this.ctx.arc(x - xOffset, y - yOffset, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "rgba(207, 102, 156, 0.4)";
        this.ctx.strokeStyle = "rgba(88, 88, 88, 1)";
        this.ctx.fill();
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.fillStyle = "rgba(88, 88, 88, 1)";
        this.ctx.fillText(this.name, x - xOffset, y - yOffset);

        this.ctx.closePath();
    }
}

/**
 * Represents a connection
 */
class Connection {
    /**
     *
     * @param {Node} node1 Source node for the connection
     * @param {Node} node2 Destination node for the connection
     */
    constructor(node1, node2) {
        this.connect = new Pair(node1, node2);
    }
}

/**
 * The driving visualizer class
 */
class Visualizer {
    /**
     *
     * @param {HTMLCanvasElement} canvas The canvas to visualize on
     * @param {number} scale The scale of the visualization
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

        this.nodes = new Array();

        this.connections = new Map();
    }

    addEventListener(name, callback) {
        this.canvas.addEventListener(name, callback);
    }

    addNode(position, name) {
        this.nodes.push(new Node(this.ctx, position, name))
    }

    toCSV() {
        //pass
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

    draw() {
        this.canvas.width = window.innerWidth * .9725;
        this.canvas.height = window.innerHeight * .85;

        this.canvas.style.marginTop = ".5%";

        this.canvas.style.borderStyle = "solid";
        this.canvas.style.borderWidth = "thick";
        this.canvas.style.borderColor = "black";

        let currentLeft = this.currentPosition.first;
        let currentRight = currentLeft + this.canvas.width;
        let currentTop = this.currentPosition.second;
        let currentBottom = currentTop + this.canvas.height;

        this.nodes.forEach(node => {
            let nodeX = node.position.first;
            let nodeY = node.position.second;

            if (currentLeft <= nodeX <= currentRight && currentTop <= nodeY <= currentBottom) {
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

        let fontSize = 15 * this.scale;
        this.ctx.font = `${fontSize}px Arial`;

        let xCoord = `X: ${this.getX()}`;
        let yCoord = `Y: ${this.getY()}`;
        this.ctx.fillText(xCoord, 45, 17);
        this.ctx.fillText(yCoord, 2, 60)

        this.ctx.closePath();
    }
}

// from https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return new Pair(x, y);
}

document.addEventListener("DOMContentLoaded", () => {
    var connectionMap = new Map();
    var visualizer = new Visualizer(document.getElementById("main"));
    var movingItem = false;
    var connecting = false;
    var deleting = false;
    var dragging = false;
    var placing = false;
    var navBar = document.getElementById("menu");
    var drawOption = document.getElementById("menu-draw");
    var connectOption = document.getElementById("menu-connect");
    var moveNodeOption = document.getElementById("menu-move-node");
    var deleteOption = document.getElementById("menu-delete");
    var saveAsHTMLOption = document.getElementById("menu-save-html");
    var saveAsCSVOption = document.getElementById("menu-save-csv");

    var lastDraggingPosition = new Pair(0, 0);

    var firstFrame = true;

    visualizer.draw();

    window.addEventListener("resize", event => {
        visualizer.draw();
    });

    window.addEventListener("mouseleave", event => {
        dragging = false;
        firstFrame = true;
    });

    visualizer.addEventListener("mouseleave", event => {
        dragging = false;
        firstFrame = true;
        visualizer.canvas.style.cursor = "default";
    });

    drawOption.addEventListener("click", (event) => {
        placing = !placing;
        if (placing) {
            drawOption.style.backgroundColor = "lightgray";
        } else {
            drawOption.style.backgroundColor = "dimgray";
        }
    });

    drawOption.addEventListener("mouseover", (event) =>{
        if (!placing) {
            drawOption.style.backgroundColor = "lightgray";
        }
    });

    drawOption.addEventListener("mouseleave", (event) => {
        if (!placing) {
            drawOption.style.backgroundColor = "dimgray";
        }
    });

    visualizer.addEventListener("mousedown", function(event) {
        event.cancelBubble = true;
        event.stopPropagation();
        dragging = true;
    });

    visualizer.addEventListener("mouseup", function(event) {
        dragging = false;
        firstFrame = true;
        visualizer.canvas.style.cursor = "default";
    });

    visualizer.addEventListener("mousemove", function(event) {
        event.cancelBubble = true;
        event.stopPropagation();
        if (dragging) {
            if (!placing && !connecting && !deleting) {
                let newPosition = getCursorPosition(visualizer.canvas, event);
                visualizer.canvas.style.cursor = "move";

                let diffX = newPosition.first - lastDraggingPosition.first;
                let diffY = newPosition.second - lastDraggingPosition.second;

                if (firstFrame) {
                    diffX = 0;
                    diffY = 0;
                    firstFrame = false;
                }

                lastDraggingPosition = newPosition;

                let newX = visualizer.getX() - diffX;
                let newY = visualizer.getY() - diffY;

                visualizer.setPosition(newX, newY);

                visualizer.draw();
            }
        }
    });

    visualizer.addEventListener("click", function(event) {
        if (placing) {
            let name = window.prompt("Enter a name for the node", (visualizer.nodes.length + 1).toString());
            if (!name) {
                name = (visualizer.nodes.length + 1).toString();
            }
            let offset = visualizer.currentPosition;
            let clickPos = getCursorPosition(visualizer.canvas, event);
            let position = new Pair(clickPos.first + offset.first, clickPos.second + offset.second)
            visualizer.addNode(position, name);
            visualizer.draw();
        }
    });
});
