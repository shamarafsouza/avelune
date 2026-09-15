import * as THREE from "three";

export function criarCena(container: HTMLDivElement) {
  const largura = container.clientWidth;
  const altura = container.clientHeight;

  // =========================================================
  // CENA
  // =========================================================

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x0b0704);

  scene.fog = new THREE.FogExp2(
    0x0e0906,
    0.022
  );

  // =========================================================
  // CÂMERA
  // =========================================================

  const camera = new THREE.PerspectiveCamera(
    52,
    largura / altura,
    0.1,
    100
  );

  camera.position.set(
    0,
    4.5,
    13
  );

  camera.lookAt(
    0,
    3.3,
    -4
  );

  // =========================================================
  // RENDERIZADOR
  // =========================================================

  const renderer =
    new THREE.WebGLRenderer({
      antialias: true,
    });

  renderer.setSize(
    largura,
    altura
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  container.appendChild(
    renderer.domElement
  );

  // =========================================================
  // MATERIAIS
  // =========================================================

  const madeira =
    new THREE.MeshStandardMaterial({
      color: 0x3b2412,
      roughness: 0.75,
      metalness: 0.03,
    });

  const madeiraClara =
    new THREE.MeshStandardMaterial({
      color: 0x5c3a1e,
      roughness: 0.68,
    });

  const madeiraEscura =
    new THREE.MeshStandardMaterial({
      color: 0x1c1108,
      roughness: 0.9,
    });

  const dourado =
    new THREE.MeshStandardMaterial({
      color: 0xc9a24a,
      roughness: 0.35,
      metalness: 0.65,
    });

  // =========================================================
  // CORES DOS LIVROS
  // =========================================================

  const cores = [
    0x6b2c22,
    0x2f3d2a,
    0x4a2f1a,
    0x22364a,
    0x5a4118,
    0x1f2a1f,
    0x3d1f1f,
  ];

  // =========================================================
  // CHÃO
  // =========================================================

  const chao =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        40,
        40
      ),
      new THREE.MeshStandardMaterial({
        color: 0x0d0805,
        roughness: 0.72,
        metalness: 0.15,
      })
    );

  chao.rotation.x =
    -Math.PI / 2;

  chao.position.y = 0;

  chao.receiveShadow = true;

  scene.add(chao);

  // =========================================================
  // PASSARELA CENTRAL
  // =========================================================

  const passarela =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        5.5,
        0.04,
        18
      ),
      new THREE.MeshStandardMaterial({
        color: 0x140c07,
        roughness: 0.5,
        metalness: 0.2,
      })
    );

  passarela.position.set(
    0,
    0.03,
    -5
  );

  scene.add(passarela);

  // =========================================================
  // PAREDE DO FUNDO
  // =========================================================

  const parede =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        32,
        15,
        0.5
      ),
      madeiraEscura
    );

  parede.position.set(
    0,
    7,
    -12
  );

  scene.add(parede);

  // =========================================================
  // LIVROS FLUTUANTES
  // =========================================================

  const livrosFlutuantes: {
    grupo: THREE.Group;
    x: number;
    y: number;
    z: number;
    velocidade: number;
    amplitude: number;
    rotacao: number;
    fase: number;
  }[] = [];

  function criarLivroFlutuante(
    x: number,
    y: number,
    z: number,
    escala: number,
    fase: number
  ) {
    const grupo =
      new THREE.Group();

    grupo.position.set(
      x,
      y,
      z
    );

    grupo.scale.setScalar(
      escala
    );

    // -------------------------------------------------------
    // CAPA INFERIOR
    // -------------------------------------------------------

    const materialCapa =
      new THREE.MeshStandardMaterial({
        color:
          cores[
            Math.floor(
              Math.random() *
                cores.length
            )
          ],
        roughness: 0.4,
        metalness: 0.15,
      });

    const capa =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.8,
          0.11,
          1.25
        ),
        materialCapa
      );

    capa.position.y =
      -0.19;

    capa.castShadow = true;

    grupo.add(
      capa
    );

    // -------------------------------------------------------
    // PÁGINAS
    // -------------------------------------------------------

    const paginas =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.67,
          0.25,
          1.08
        ),
        new THREE.MeshStandardMaterial({
          color: 0xd9c9a7,
          roughness: 0.9,
        })
      );

    paginas.castShadow = true;

    grupo.add(
      paginas
    );

    // -------------------------------------------------------
    // CAPA SUPERIOR
    // -------------------------------------------------------

    const capaSuperior =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.8,
          0.11,
          1.25
        ),
        materialCapa
      );

    capaSuperior.position.y =
      0.19;

    capaSuperior.castShadow =
      true;

    grupo.add(
      capaSuperior
    );

    // -------------------------------------------------------
    // DETALHE DOURADO
    // -------------------------------------------------------

    const detalhe =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.55,
          0.025,
          0.04
        ),
        dourado
      );

    detalhe.position.set(
      0,
      0.255,
      0
    );

    grupo.add(
      detalhe
    );

    // -------------------------------------------------------
    // ROTAÇÃO INICIAL
    // -------------------------------------------------------

    grupo.rotation.x =
      -0.15 +
      Math.random() *
        0.25;

    grupo.rotation.z =
      -0.18 +
      Math.random() *
        0.36;

    scene.add(
      grupo
    );

    livrosFlutuantes.push({
      grupo,
      x,
      y,
      z,
      velocidade:
        0.35 +
        Math.random() *
          0.35,
      amplitude:
        0.12 +
        Math.random() *
          0.12,
      rotacao:
        0.15 +
        Math.random() *
          0.15,
      fase,
    });
  }

  criarLivroFlutuante(
    -4.7,
    5.4,
    -2.5,
    0.75,
    0
  );

  criarLivroFlutuante(
    4.8,
    5.8,
    -4,
    0.62,
    1.8
  );

  criarLivroFlutuante(
    -3.9,
    7.2,
    -7,
    0.5,
    3.2
  );

  criarLivroFlutuante(
    4.1,
    7,
    -8,
    0.48,
    4.7
  );

  criarLivroFlutuante(
    0,
    8.2,
    -9,
    0.42,
    2.5
  );

  // =========================================================
  // ESTANTES
  // =========================================================

  function criarEstante(
    x: number,
    z: number,
    escala = 1
  ) {
    const estante =
      new THREE.Group();

    estante.position.set(
      x,
      0,
      z
    );

    estante.scale.setScalar(
      escala
    );

    // -------------------------------------------------------
    // LATERAIS
    // -------------------------------------------------------

    const lateralGeometry =
      new THREE.BoxGeometry(
        0.35,
        7.5,
        1.15
      );

    const esquerda =
      new THREE.Mesh(
        lateralGeometry,
        madeira
      );

    esquerda.position.set(
      -2.65,
      3.75,
      0
    );

    esquerda.castShadow = true;

    estante.add(
      esquerda
    );

    const direita =
      new THREE.Mesh(
        lateralGeometry,
        madeira
      );

    direita.position.set(
      2.65,
      3.75,
      0
    );

    direita.castShadow = true;

    estante.add(
      direita
    );

    // -------------------------------------------------------
    // FUNDO
    // -------------------------------------------------------

    const fundo =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          5.1,
          7.2,
          0.2
        ),
        madeiraEscura
      );

    fundo.position.set(
      0,
      3.6,
      -0.5
    );

    estante.add(
      fundo
    );

    // -------------------------------------------------------
    // PRATELEIRAS
    // -------------------------------------------------------

    const niveis = [
      1.25,
      2.85,
      4.45,
      6.05,
      7.25,
    ];

    niveis.forEach(
      (y, index) => {
        const prateleira =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              5.45,
              0.28,
              1.25
            ),
            index % 2 === 0
              ? madeiraClara
              : madeira
          );

        prateleira.position.set(
          0,
          y,
          0
        );

        prateleira.castShadow =
          true;

        estante.add(
          prateleira
        );
      }
    );

    // -------------------------------------------------------
    // LIVROS DA ESTANTE
    // -------------------------------------------------------

    const alturas = [
      1.25,
      2.85,
      4.45,
      6.05,
    ];

    alturas.forEach(
      (y, nivel) => {
        let posicaoX =
          -2.35;

        for (
          let i = 0;
          i < 13;
          i++
        ) {
          const larguraLivro =
            0.25 +
            Math.random() *
              0.3;

          const alturaLivro =
            0.9 +
            Math.random() *
              0.4;

          const materialLivro =
            new THREE.MeshStandardMaterial({
              color:
                cores[
                  Math.floor(
                    Math.random() *
                      cores.length
                  )
                ],
              roughness: 0.62,
              metalness: 0.04,
            });

          const livro =
            new THREE.Mesh(
              new THREE.BoxGeometry(
                larguraLivro,
                alturaLivro,
                0.78
              ),
              materialLivro
            );

          livro.position.set(
            posicaoX,
            y +
              alturaLivro /
                2 +
              0.17,
            0
          );

          livro.rotation.z =
            (Math.random() -
              0.5) *
            0.07;

          livro.castShadow =
            true;

          estante.add(
            livro
          );

          posicaoX +=
            larguraLivro +
            0.075;

          if (
            posicaoX >
            2.35
          ) {
            break;
          }
        }

        // -----------------------------------------------------
        // DETALHE DOURADO
        // -----------------------------------------------------

        if (
          nivel === 1 ||
          nivel === 3
        ) {
          const detalhe =
            new THREE.Mesh(
              new THREE.BoxGeometry(
                0.05,
                1.05,
                0.05
              ),
              dourado
            );

          detalhe.position.set(
            0,
            y + 0.65,
            -0.43
          );

          estante.add(
            detalhe
          );
        }
      }
    );

    scene.add(
      estante
    );

    return estante;
  }

  // =========================================================
  // ESTANTES
  // =========================================================

  criarEstante(
    -6.8,
    -3,
    1.05
  );

  criarEstante(
    6.8,
    -3,
    1.05
  );

  criarEstante(
    -6.8,
    -9,
    1.05
  );

  criarEstante(
    6.8,
    -9,
    1.05
  );

  // =========================================================
  // ARCOS
  // =========================================================

  function criarArco(
    x: number,
    z: number
  ) {
    const arco =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          2.7,
          0.16,
          12,
          48,
          Math.PI
        ),
        madeiraClara
      );

    arco.rotation.z =
      Math.PI;

    arco.position.set(
      x,
      7.9,
      z
    );

    scene.add(
      arco
    );
  }

  criarArco(
    -6.8,
    -3
  );

  criarArco(
    6.8,
    -3
  );

  // =========================================================
  // COLUNAS
  // =========================================================

  function criarColuna(
    x: number,
    z: number
  ) {
    const coluna =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.42,
          0.55,
          9,
          20
        ),
        madeira
      );

    coluna.position.set(
      x,
      4.5,
      z
    );

    coluna.castShadow =
      true;

    scene.add(
      coluna
    );

    const base =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.75,
          0.75,
          0.25,
          20
        ),
        madeiraClara
      );

    base.position.set(
      x,
      0.15,
      z
    );

    scene.add(
      base
    );

    [3, 6].forEach(
      (y) => {
        const detalhe =
          new THREE.Mesh(
            new THREE.TorusGeometry(
              0.47,
              0.045,
              8,
              24
            ),
            dourado
          );

        detalhe.rotation.x =
          Math.PI / 2;

        detalhe.position.set(
          x,
          y,
          z
        );

        scene.add(
          detalhe
        );
      }
    );
  }

  criarColuna(
    -3.3,
    -5.8
  );

  criarColuna(
    3.3,
    -5.8
  );

  // =========================================================
  // MESA CENTRAL
  // =========================================================

  const mesa =
    new THREE.Group();

  const tampo =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        4.5,
        0.3,
        2.1
      ),
      madeiraClara
    );

  tampo.position.y =
    2.15;

  tampo.castShadow =
    true;

  mesa.add(
    tampo
  );

  const borda =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        4.55,
        0.08,
        2.15
      ),
      dourado
    );

  borda.position.y =
    2.31;

  mesa.add(
    borda
  );

  const pernaGeometry =
    new THREE.CylinderGeometry(
      0.18,
      0.25,
      2.1,
      16
    );

  const pernas = [
    [-1.8, -0.75],
    [1.8, -0.75],
    [-1.8, 0.75],
    [1.8, 0.75],
  ];

  pernas.forEach(
    ([x, z]) => {
      const perna =
        new THREE.Mesh(
          pernaGeometry,
          madeira
        );

      perna.position.set(
        x,
        1.05,
        z
      );

      perna.castShadow =
        true;

      mesa.add(
        perna
      );
    }
  );

  mesa.position.set(
    0,
    0,
    0.8
  );

  scene.add(
    mesa
  );

  // =========================================================
  // LIVRO CENTRAL
  // =========================================================

  const livro =
    new THREE.Group();

  livro.position.set(
    0,
    2.55,
    0
  );

  mesa.add(
    livro
  );

  const capaGeometry =
    new THREE.BoxGeometry(
      2.35,
      0.12,
      1.55
    );

  const capaMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x4a1f1f,
      roughness: 0.4,
      metalness: 0.15,
    });

  // Capa inferior

  const capaInferior =
    new THREE.Mesh(
      capaGeometry,
      capaMaterial
    );

  capaInferior.position.y =
    -0.28;

  capaInferior.castShadow =
    true;

  livro.add(
    capaInferior
  );

  // Páginas

  const paginas =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        2.16,
        0.3,
        1.38
      ),
      new THREE.MeshStandardMaterial({
        color: 0xe0d1ae,
        roughness: 0.9,
      })
    );

  paginas.castShadow =
    true;

  livro.add(
    paginas
  );

  // Capa superior

  const capaSuperior =
    new THREE.Mesh(
      capaGeometry,
      capaMaterial
    );

  capaSuperior.position.y =
    0.28;

  capaSuperior.castShadow =
    true;

  livro.add(
    capaSuperior
  );

  // Símbolo dourado

  const simbolo =
    new THREE.Group();

  const circulo =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        0.28,
        0.035,
        8,
        32
      ),
      dourado
    );

  simbolo.add(
    circulo
  );

  const linha =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.06,
        0.45,
        0.04
      ),
      dourado
    );

  linha.rotation.z =
    Math.PI / 4;

  simbolo.add(
    linha
  );

  simbolo.position.y =
    0.36;

  simbolo.rotation.x =
    Math.PI / 2;

  livro.add(
    simbolo
  );

  // =========================================================
  // VELAS
  // =========================================================

  const velas: THREE.Group[] =
    [];

  function criarVela(
    x: number,
    y: number,
    z: number
  ) {
    const vela =
      new THREE.Group();

    vela.position.set(
      x,
      y,
      z
    );

    const corpo =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.12,
          0.15,
          0.72,
          16
        ),
        new THREE.MeshStandardMaterial({
          color: 0xd9ceb9,
          roughness: 0.8,
        })
      );

    corpo.castShadow =
      true;

    vela.add(
      corpo
    );

    const chama =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.12,
          16,
          16
        ),
        new THREE.MeshStandardMaterial({
          color: 0xffc56c,
          emissive: 0xff7928,
          emissiveIntensity: 4,
        })
      );

    chama.scale.set(
      0.65,
      1.6,
      0.65
    );

    chama.position.y =
      0.52;

    vela.add(
      chama
    );

    const luz =
      new THREE.PointLight(
        0xffa04a,
        16,
        5
      );

    luz.position.y =
      0.5;

    vela.add(
      luz
    );

    scene.add(
      vela
    );

    velas.push(
      vela
    );
  }

  criarVela(
    -3.7,
    2.5,
    0.1
  );

  criarVela(
    3.7,
    2.5,
    0.1
  );

  criarVela(
    -3.3,
    0.2,
    -3
  );

  criarVela(
    3.3,
    0.2,
    -3
  );

  // =========================================================
  // POEIRA DOURADA
  // =========================================================

  const quantidade =
    1200;

  const posicoes =
    new Float32Array(
      quantidade * 3
    );

  for (
    let i = 0;
    i < quantidade;
    i++
  ) {
    posicoes[i * 3] =
      (Math.random() - 0.5) *
      22;

    posicoes[i * 3 + 1] =
      Math.random() *
      10;

    posicoes[i * 3 + 2] =
      -Math.random() *
      17;
  }

  const particulasGeometry =
    new THREE.BufferGeometry();

  particulasGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      posicoes,
      3
    )
  );

  const particulasMaterial =
    new THREE.PointsMaterial({
      color: 0xd4a94a,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

  const particulas =
    new THREE.Points(
      particulasGeometry,
      particulasMaterial
    );

  scene.add(
    particulas
  );

  // =========================================================
  // LUZES
  // =========================================================

  const ambiente =
    new THREE.AmbientLight(
      0x4a3b28,
      1.4
    );

  scene.add(
    ambiente
  );

  const luzCentral =
    new THREE.PointLight(
      0xffa947,
      110,
      28
    );

  luzCentral.position.set(
    0,
    6,
    3
  );

  scene.add(
    luzCentral
  );

  const luzEsquerda =
    new THREE.PointLight(
      0xff8c3c,
      70,
      22
    );

  luzEsquerda.position.set(
    -7,
    5,
    1
  );

  scene.add(
    luzEsquerda
  );

  const luzDireita =
    new THREE.PointLight(
      0xff8c3c,
      70,
      22
    );

  luzDireita.position.set(
    7,
    5,
    1
  );

  scene.add(
    luzDireita
  );

  // =========================================================
  // MOUSE
  // =========================================================

  let mouseX = 0;
  let mouseY = 0;

  function moverMouse(
    event: MouseEvent
  ) {
    mouseX =
      event.clientX /
        window.innerWidth -
      0.5;

    mouseY =
      event.clientY /
        window.innerHeight -
      0.5;
  }

  window.addEventListener(
    "mousemove",
    moverMouse
  );

  // =========================================================
  // ANIMAÇÃO
  // =========================================================

  const clock =
    new THREE.Clock();

  function animar() {
    requestAnimationFrame(
      animar
    );

    const tempo =
      clock.getElapsedTime();

    // -------------------------------------------------------
    // CÂMERA
    // -------------------------------------------------------

    const destinoX =
      mouseX * 1.8;

    const destinoY =
      4.5 -
      mouseY * 0.7;

    camera.position.x +=
      (
        destinoX -
        camera.position.x
      ) * 0.025;

    camera.position.y +=
      (
        destinoY -
        camera.position.y
      ) * 0.025;

    camera.lookAt(
      0,
      3.3,
      -4
    );

    // -------------------------------------------------------
    // LIVRO CENTRAL
    // -------------------------------------------------------

    livro.position.y =
      2.55 +
      Math.sin(
        tempo * 1.3
      ) * 0.09;

    livro.rotation.y =
      Math.sin(
        tempo * 0.55
      ) * 0.08;

    // -------------------------------------------------------
    // LIVROS FLUTUANTES
    // -------------------------------------------------------

    livrosFlutuantes.forEach(
      (item) => {
        const {
          grupo,
          x,
          y,
          z,
          velocidade,
          amplitude,
          rotacao,
          fase,
        } = item;

        grupo.position.x =
          x +
          Math.sin(
            tempo *
              velocidade +
              fase
          ) *
            0.18;

        grupo.position.y =
          y +
          Math.sin(
            tempo *
              velocidade *
              1.4 +
              fase
          ) *
            amplitude;

        grupo.position.z =
          z +
          Math.cos(
            tempo *
              velocidade +
              fase
          ) *
            0.12;

        grupo.rotation.y +=
          0.002 *
          rotacao;

        grupo.rotation.z =
          Math.sin(
            tempo *
              velocidade *
              0.7 +
              fase
          ) *
          0.08;
      }
    );

    // -------------------------------------------------------
    // POEIRA
    // -------------------------------------------------------

    particulas.rotation.y =
      tempo * 0.012;

    particulas.position.y =
      Math.sin(
        tempo * 0.35
      ) * 0.3;

    // -------------------------------------------------------
    // VELAS
    // -------------------------------------------------------

    velas.forEach(
      (vela, index) => {
        vela.rotation.z =
          Math.sin(
            tempo * 3 +
              index
          ) * 0.025;
      }
    );

    // -------------------------------------------------------
    // LUZ CENTRAL
    // -------------------------------------------------------

    luzCentral.intensity =
      105 +
      Math.sin(
        tempo * 1.4
      ) * 12;

    // -------------------------------------------------------
    // RENDER
    // -------------------------------------------------------

    renderer.render(
      scene,
      camera
    );
  }

  animar();

  // =========================================================
  // RESPONSIVIDADE
  // =========================================================

  function redimensionar() {
    const novaLargura =
      container.clientWidth;

    const novaAltura =
      container.clientHeight;

    camera.aspect =
      novaLargura /
      novaAltura;

    camera.updateProjectionMatrix();

    renderer.setSize(
      novaLargura,
      novaAltura
    );
  }

  window.addEventListener(
    "resize",
    redimensionar
  );

  // =========================================================
  // LIMPEZA
  // =========================================================

  return () => {
    window.removeEventListener(
      "resize",
      redimensionar
    );

    window.removeEventListener(
      "mousemove",
      moverMouse
    );

    scene.traverse(
      (objeto) => {
        if (
          objeto instanceof
          THREE.Mesh
        ) {
          objeto.geometry.dispose();

          if (
            Array.isArray(
              objeto.material
            )
          ) {
            objeto.material.forEach(
              (material) => {
                material.dispose();
              }
            );
          } else {
            objeto.material.dispose();
          }
        }
      }
    );

    particulasGeometry.dispose();

    particulasMaterial.dispose();

    renderer.dispose();

    if (
      container.contains(
        renderer.domElement
      )
    ) {
      container.removeChild(
        renderer.domElement
      );
    }
  };
}