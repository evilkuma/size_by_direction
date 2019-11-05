
(function() {

  THREE.Vector3.prototype.toFixed = function(a = 10) {
    this.x = +this.x.toFixed(a)
    this.y = +this.y.toFixed(a)
    this.z = +this.z.toFixed(a)
    return this
  }

  /**
   * ----------------------
   */

  function Mark(material) {
    this.constructor(new THREE.SphereGeometry(.2, 30), material)

    var outline = new THREE.Mesh(
      this.geometry,
      new THREE.MeshPhongMaterial( { color: 0xff0000, side: THREE.BackSide } )
    )
    outline.scale.multiplyScalar(1.2)
    outline.visible = false
    this.add(outline)

    this.mark = function(color) {
      outline.visible = !!color

      if(["string", "number"].includes(typeof color)) {
        outline.material.color.set(color)
      }
    }

  }
  Mark.prototype = Object.create(THREE.Mesh.prototype)

  function watchVec(v, events) {

    var props = {}

    for(let k of Object.keys(events)) {

      events[k] = events[k].bind(v)

      v['_'+k] = v[k]

      props[k] = {
        get() {
          return v['_'+k]
        },
        set(val) {
          v['_'+k] = val
          events[k]()
        }
      }

    }

    Object.defineProperties(v, props)

  }

  /**
   * ---------------------------
   */

  var three = new THREE.DefaultScene(document.body)
  var gui = new dat.GUI 

  var raycaster = new THREE.Raycaster
  var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0))

  var obj = false
  var objs = []

  three.renderer.domElement.addEventListener('mousemove', function(e) {

    raycaster.setFromCamera( new THREE.Vector2(
      ( e.clientX / window.innerWidth ) * 2 - 1,
      - ( e.clientY / window.innerHeight ) * 2 + 1
    ), three.camera );

    if(obj) {

      obj.position.copy(raycaster.ray.intersectPlane(plane, new THREE.Vector3))

    } else {

      objs.forEach(o => o.mark(false))

      var info = raycaster.intersectObjects(objs)

      if(info[0]) info[0].object.mark('red')

    }

  }, false)

  three.renderer.domElement.addEventListener('mousedown', function(e) {

    objs.forEach(o => o.mark(false))

    var info = raycaster.intersectObjects(objs)

    if(info[0]) {

      info[0].object.mark('green')
      obj = info[0].object

    }

  }, false)

  three.renderer.domElement.addEventListener('mouseup', function(e) {

    if(obj) {
      obj.mark('red')
      obj = false
    }

  }, false)

  var arrow = new THREE.ArrowHelper
  arrow.setLength(2)
  var vec = new THREE.Vector3

  // var line1 = new THREE.Line(new THREE.BufferGeometry, new THREE.LineBasicMaterial({color: 'blue'}))

  var sph = new Mark(new THREE.MeshPhongMaterial({color: 'green'}))
  watchVec(sph.position, {
    x() {
      arrow.setDirection(vec.copy(sph.position).normalize())
    },
    z() {
      arrow.setDirection(vec.copy(sph.position).normalize())
    }
  })
  sph.position.z = 1

  var size = [1, 2]
  var object = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshPhongMaterial({color: 'red'}))
  object.position.y = -.1
  object.rotation.x = -Math.PI/2

  object.rotation.z = Math.PI/180*5

  gui.add({ 
    get rot() {
      return object.rotation.z/Math.PI*180
    },
    set rot(val) {
      object.rotation.z = val/180*Math.PI
    }
  }, 'rot', 0, 180, 1)

  objs.push(sph)
  three.scene.add(sph, arrow, object)

})()
