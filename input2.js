                // Eléments de paramétrage
                const input2ID = 'secriVisibleAttributes'; //ID de l'input visible
		const timing   = 2000; //Timing pour la suppression auto
		const keyboardRegex = /[a-zA-Z0-9\'\"\=\-\_ ]/; // Regex d'autorisation des touches du clavier
		const submitRegex = /src=["']{1}.*/; // Regex d'identification de chaînes interdites
		const inputMaxLength = 20; // Longueur maximale d'une chaîne dans l'input visible
		const inputPlaceHolder = '';
		const ctaDeleteAll = 'Tout effacer';
				
		// Fonction qui se lance toute seule pour rester en scope local
		(function() {
		
			// on crée une variable qui récupère l'input caché
			let submitInput = document.getElementById('secriSubmitAttributes');
			
			// on génère l'input2 en javascript et on le place juste avant l'input caché
			let input2 = document.createElement('input');
			input2.setAttribute('type', 'text');
			if (Number.isInteger(inputMaxLength) && inputMaxLength > 0) {
				input2.setAttribute('maxlength', inputMaxLength.toString());
			}
			input2.setAttribute('id', input2ID);
			input2.setAttribute('value', submitInput.value); // On met les valeurs de l'input caché dans l'input visible
			if (inputPlaceHolder.length > 0) {
				input2.setAttribute('placeholder', inputPlaceHolder);
			}

			// on met l'input 2 juste avant l'input caché dans le conteneur parent
			document.getElementById('secriSubmitAttributes').parentNode.prepend(input2);
					
			// on crée une variable qui récupère l'input2
			let theInput = document.getElementById(input2ID);
			
			// On cible le parent par défaut de l'input visible, à priori un <td> par défaut sous Wordpress
			let getParentNode = theInput.parentNode;
			
			// On crée le conteneur principal et on lui attribue une class
			let wrapper = document.createElement('div');
			wrapper.setAttribute('class', 'inputWrapper');
			
			// On crée le conteneur secondaire destiné à recevoir les mot-clés
			let keywordsWrapper = document.createElement('div');
			
			// On crée la div action pour la fonction deleteKeyword
			let actionDiv = document.createElement('div');
			actionDiv.setAttribute('class', 'action');
			let delButton = document.createElement('div');
			delButton.textContent = ctaDeleteAll;
			actionDiv.appendChild(delButton);
			
			// On remplace l'input par le conteneur dans l'élément parent et on met l'input dans le wrapper
			getParentNode.replaceChild(wrapper, theInput);
			wrapper.appendChild(keywordsWrapper);
			wrapper.appendChild(actionDiv);
			keywordsWrapper.appendChild(theInput);
			
			// On appelle la fonction d'isolation des mot-clés après le chargement du DOM
			includeKeywords(theInput.value.split(' ').reverse(), theInput);
			
			// On appelle la fonction de gestion du clavier lorsque l'utilisateur appuie sur un touche du clavier
			theInput.onkeydown = handle;
			
			// On appelle la fonction qui gère les espaces dans l'input affiché en front
			theInput.addEventListener('input', handleSpaces);
			
			/**** FONCTIONS ****/
			// Fonction d'injection des mot-clés dans le conteneur à part
			function includeKeywords(array, input, autoDel='no') {
				
				for (const element of array) {
					
					if (element != '') {
					
						let cartouche = document.createElement('div');
						
						if (autoDel == 'yes') {
							cartouche.setAttribute('class', 'srcError'); 
						}
						
						cartouche.textContent = element.toLowerCase();
						
						let fermer = document.createElement('i');
						
						cartouche.appendChild(fermer);
						
						keywordsWrapper.prepend(cartouche);
											
					}
						
				}
				
				handleVisibility(); //appel de la fonction de la gestion de la visibilité du bouton Del				
				
				input.value = '';
				ecouteur();
				deleteAll();
					
				if (autoDel == 'yes') { 
					
					setTimeout( () => { document.querySelectorAll('.inputWrapper .srcError').forEach( (element) => element.remove() ); }, timing);
					
				} else { 
					
					submitInput.value = pushToSubmitButton();
					
				}
				
			}
			
			// Fonction de restriction des entrées au clavier. Vérification que l'utilisateur n'essaye pas d'entrer une src.
			function handle(e) {
		
				if ( !e.key.match(keyboardRegex) ) {
				
					e.preventDefault();  
					
				}
			
				if (e.code === 'Space' && theInput.value.length > 0) {
				
					if (theInput.value.match(submitRegex) || checkRedundant(theInput.value) ) {
					
						includeKeywords([theInput.value], theInput, 'yes');
						
					} else {
						
						includeKeywords([theInput.value], theInput);
					
					}
						
				}
			
			}
			
			// Fonction de gestion des entrées dans l'input, impossible de commencer la première chaîne de caractères par un espace
			function handleSpaces(e) {
			
				let currentValue = this.value;
				
				if (currentValue === ' ') {
					
					this.value = '';
				
					return;
				}
			
			}
			
			// Fonction de création d'un écouteur permettant de réagir aux clics sur les boutons de suppression
			function ecouteur() {
		
				let cartoucheCollection = document.querySelectorAll('.inputWrapper > div:nth-child(1) div i');

				for (const element of cartoucheCollection) {
					element.onclick = deleteKeyword;
				}
		
			}
			
			// Fonction de suppression des mot-clés et de modification de la valeur de l'input caché
			function deleteKeyword() {
		
				this.parentElement.remove();
							
				let getHiddenValue = document.getElementById('secriSubmitAttributes').value.split(' ');
				
				let newHiddenValue = getHiddenValue.filter( (word) => word != this.parentElement.textContent );
				
				document.getElementById('secriSubmitAttributes').value = newHiddenValue.join(' ');
				
				handleVisibility();
			}
			
			//Fonction qui check si le mot clé entré n'existe pas déjà
			function checkRedundant (value) {
			
				const keywordsCollection = document.querySelectorAll('.inputWrapper > div:nth-child(1) > div');
				
				for (const element of keywordsCollection) {
				
					if (value == element.textContent) {
					
						return true;
					
					}
				
				}
				
				return false;
			
			}
			
			// Fonction qui pousse les mot-clés dans l'attribut value de l'input caché
			function pushToSubmitButton() {
			
				let keyWords = document.querySelectorAll('.inputWrapper div:nth-child(1) > div');
				
				let valueString = [];
				
				for (const element of keyWords) {
				
					valueString.push(element.textContent);
					
				}

				return valueString.join(' ');
			
			}
			
			// Fonction de gestion du bouton delete All
			function deleteAll() {
			
				const keywordsCollection = document.querySelectorAll('.inputWrapper > div:nth-child(1) > div');
				
				delButton.addEventListener('click', () => {
					
					for (const element of keywordsCollection) {
						
						element.remove();
							
					}
						
					submitInput.value = '';
					
					handleVisibility();
						
				});
				
			}
			
			function handleVisibility() {
			
				let countKeywords = document.querySelectorAll('.inputWrapper > div:nth-child(1) div');
				
				if (countKeywords.length > 1) {
				
					delButton.style.display = 'block';
					
				} else {
				
					delButton.style.display = 'none';
					
				}
			
			}
		
		})();
