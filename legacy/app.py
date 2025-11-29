from flask import Flask, render_template, request, jsonify
import subprocess
import logging
from googletrans import Translator

app = Flask(__name__)

# Configurer le logging
logging.basicConfig(level=logging.DEBUG)

# Initialiser le traducteur
translator = Translator()

# Fonction pour appeler Llama2 via une commande externe
def get_story_from_llama2(prompt):
    try:
        logging.debug(f"Prompt sent to Llama2: {prompt}")

        # Lancer la commande subprocess pour exécuter Llama2
        result = subprocess.run(
            ['ollama', 'run', 'llama2'],
            input=prompt.encode('utf-8'),  # Passer le prompt plus détaillé
            capture_output=True,
            timeout=300  # Timeout plus long pour éviter les erreurs
        )

        # Vérifier la sortie
        if result.returncode == 0:
            story = result.stdout.decode('utf-8').strip()
            logging.debug(f"Generated synopsis: {story}")
            return story
        else:
            error_output = result.stderr.decode('utf-8').strip()
            logging.error(f"Error executing command: {error_output}")
            return f"Error: {error_output}"
    except subprocess.TimeoutExpired:
        logging.error("The command timed out, please try again later.")
        return "The command timed out, please try again later."
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return f"An error occurred: {str(e)}"

# Fonction pour continuer l'histoire en fonction du choix de l'utilisateur
def continue_story(current_story, choice):
    try:
        logging.debug(f"User choice: {choice}")

        # Construire un nouveau prompt pour continuer l'histoire
        prompt = f"Continue the story based on the following choice: {choice}. Here is the current story: {current_story}. Provide three new choices just three at the end to continue the story and display them as follows:\nChoice 1:....\nChoice 2:.....\nChoice 3:....\n"

        # Appeler Llama2 pour générer la suite de l'histoire
        result = subprocess.run(
            ['ollama', 'run', 'llama2'],
            input=prompt.encode('utf-8'),  # Passer le prompt plus détaillé
            capture_output=True,
            timeout=300  # Timeout plus long pour éviter les erreurs
        )

        # Vérifier la sortie
        if result.returncode == 0:
            story = result.stdout.decode('utf-8').strip()
            logging.debug(f"Generated story continuation: {story}")
            return story
        else:
            error_output = result.stderr.decode('utf-8').strip()
            logging.error(f"Error generating story continuation: {error_output}")
            return f"Error: {error_output}"
    except subprocess.TimeoutExpired:
        logging.error("The command timed out, please try again later.")
        return "The command timed out, please try again later."
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return f"An error occurred: {str(e)}"

# Fonction pour traduire le texte en français
def translate_to_french(text):
    try:
        translation = translator.translate(text, src='en', dest='fr')
        return translation.text
    except Exception as e:
        logging.error(f"Translation error: {str(e)}")
        return text  # Retourner le texte original en cas d'erreur de traduction

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_story', methods=['POST'])
def generate_story():
    user_input = request.json.get('theme')
    if not user_input:
        return jsonify({'error': 'Aucun thème fourni.'}), 400

    # Utiliser la fonction `get_story_from_llama2` pour générer un synopsis
    prompt = f"Create a short synopsis for an interactive adventure game based on the theme: {user_input}. The synopsis should include a summary of the world, key characters, and a main objective for the player. I also want you to provide three choices and only three choices to the user to continue the story and you must display them as follows:\nChoice 1:....\nChoice 2:.....\nChoice 3:....\n"
    story = get_story_from_llama2(prompt)
    if story:
        # Traduire le synopsis en français
        translated_story = translate_to_french(story)
        return jsonify({'story': translated_story})
    else:
        return jsonify({'error': 'Erreur lors de la génération du synopsis.'})

@app.route('/continue_story', methods=['POST'])
def continue_story_route():
    user_choice = request.json.get('choice')
    current_story = request.json.get('current_story')
    if not user_choice or not current_story:
        return jsonify({'error': 'Aucun choix ou histoire en cours fourni.'}), 400

    # Utiliser la fonction `continue_story` pour générer la suite de l'histoire
    story = continue_story(current_story, user_choice)
    if story:
        # Traduire la suite de l'histoire en français
        translated_story = translate_to_french(story)
        return jsonify({'story': translated_story})
    else:
        return jsonify({'error': 'Erreur lors de la génération de la suite de l\'histoire.'})

if __name__ == '__main__':
    app.run(debug=True)
