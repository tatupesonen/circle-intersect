import './style.css'

const canvas = document.querySelector('#circles')
const logElem = document.querySelector('#log')
const ctx = canvas.getContext('2d');

let circleSize = 50;
let mousePos = [0, 0]

canvas.addEventListener('mousemove', (pos) => {
  getMousePos(canvas, pos);
  draw(canvas, ctx)
})

canvas.addEventListener('wheel', (evt) => {
  circleSize += (evt.deltaY / 30)
  draw(canvas, ctx)
})

const highlightIntersection = (center1, center2, radius, intersections) => {
  ctx.beginPath();
  ctx.moveTo(...intersections[0]);
  ctx.arc(center1[0], center1[1], radius, Math.atan2(intersections[0][1] - center1[1], intersections[0][0] - center1[0]), Math.atan2(intersections[1][1] - center1[1], intersections[1][0] - center1[0]));
  ctx.lineTo(...intersections[1]);
  ctx.arc(center2[0], center2[1], radius, Math.atan2(intersections[1][1] - center2[1], intersections[1][0] - center2[0]), Math.atan2(intersections[0][1] - center2[1], intersections[0][0] - center2[0]));
  ctx.closePath();
  ctx.fillStyle = "blue";
  ctx.fill();
}


const draw = (canvas, ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerCoords = [ canvas.width / 2, canvas.height / 2 ];
  createCircle(centerCoords, circleSize, "green");
  createCircle(mousePos, circleSize, "red");

  // Check if circles intersect
  const intersections = findCircleIntersections(centerCoords, circleSize, mousePos, circleSize);
  
  if (intersections) {
    // Draw the intersection points
    intersections.forEach(point => {
      createCircle(point, 5, "yellow");
    });

    // Highlight the intersection area in blue
    highlightIntersection(centerCoords, mousePos, circleSize, intersections);
  }

  // draw line from cursor to center
  lineBetween(mousePos, centerCoords, `from: ${mousePos}`, "red", "2")

  drawShortEdges(centerCoords, mousePos)
  // Draw radii
  drawCircleRadii(centerCoords, mousePos, circleSize, "black")
  drawCircleRadii(mousePos, centerCoords, circleSize, "white")
}

const getMousePos = (canvas, evt) => {
  var rect = canvas.getBoundingClientRect();
  mousePos =  [
    evt.clientX - rect.left,
    evt.clientY - rect.top
  ]
}

const createCircle = ( [x, y], radius, color = "white") => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.closePath();
}

const findCircleIntersections = (c1, r1, c2, r2) => {
  const d = Math.sqrt((c2[0] - c1[0]) ** 2 + (c2[1] - c1[1]) ** 2);

  // No intersection if distance is greater than the sum of the radii or less than their absolute difference
  if (d > r1 + r2 || d < Math.abs(r1 - r2)) {
    return null;
  }

  // Find point where the line connecting the two centers intersects the line between the two intersection points
  const a = (r1 ** 2 - r2 ** 2 + d ** 2) / (2 * d);
  const h = Math.sqrt(r1 ** 2 - a ** 2);

  // Midpoint between the two intersection points
  const midX = c1[0] + a * (c2[0] - c1[0]) / d;
  const midY = c1[1] + a * (c2[1] - c1[1]) / d;

  // Intersection points
  const intersection1 = [
    midX + h * (c2[1] - c1[1]) / d,
    midY - h * (c2[0] - c1[0]) / d,
  ];
  const intersection2 = [
    midX - h * (c2[1] - c1[1]) / d,
    midY + h * (c2[0] - c1[0]) / d,
  ];

  return [intersection1, intersection2];
}

const calculateIntersection = (from, to, radius) => {
  const dirX = to[0] - from[0];
  const dirY = to[1] - from[1];
  const dist = Math.sqrt(dirX * dirX + dirY * dirY);
  const unitX = dirX / dist;
  const unitY = dirY / dist;

  const intersectionX = from[0] + unitX * radius;
  const intersectionY = from[1] + unitY * radius;

  return [intersectionX, intersectionY];
}

const drawCircleRadii = (from, to, radius, color) => {
  const intersectionPoint = calculateIntersection(from, to, radius);
  lineBetween(from, intersectionPoint, "", color, "2")
}

const drawShortEdges = (from, to) => {
  const dy1 = to[1]
  lineBetween(from, [from[0], dy1], "", "2", "white", "2", true)
  lineBetween([from[0], dy1], to, "", "2", "white", "2", true)
}

const lineBetween = (from, to, text = "", color = "red", width = "8", dashed = false) => {
  ctx.beginPath();
  if(dashed) {
    ctx.setLineDash([15, 10]);
  } else {
    ctx.setLineDash([])
  }
  ctx.moveTo(...from)
  ctx.lineTo(...to)
  ctx.strokeStyle = color
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.closePath();

  if(text !== "") {
    ctx.font = "24px monospace";
    ctx.fillStyle = "yellow";
    const betweenX = (from[0] + to[0]) / 2
    const betweenY = ((from[1] + to[1]) / 2) - 20
    ctx.fillText(text, betweenX, betweenY);
  }
  ctx.strokeStyle = "white"
}

draw(canvas, ctx)