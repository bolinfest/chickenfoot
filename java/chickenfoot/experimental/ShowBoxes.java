
package chickenfoot.experimental;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.StringReader;
import java.util.*;

import javax.imageio.ImageIO;
import javax.swing.JComponent;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.*;
import org.xml.sax.InputSource;

/*

clear();
info = new DocumentInfo();
mappings = info.node2box.entrySet();
sb = new StringBuffer('<boxes>\n');
for (var i = 0; i < mappings.length; i++) {
 var box = mappings[i].value;
 sb.append('<box x="');
 sb.append(box.x);
 sb.append('" y="');
 sb.append(box.y);
 sb.append('" w="');
 sb.append(box.w);
 sb.append('" h="');
 sb.append(box.h);
 sb.append('" type="');
 sb.append(mappings[i].key.nodeType);
 sb.append('" ');
 if (mappings[i].key.nodeType == Node.ELEMENT_NODE) {
     sb.append('tagName="');
     sb.append(mappings[i].key.tagName);
     sb.append('" ');
 }
 sb.append(' />\n');
}
sb.append('</boxes>\n')
var str = sb.toString();

file = cf_choose_file(false);
cf_simple_write(file, str);
 */
public class ShowBoxes extends JComponent {

    static final String PNG_FORMAT = "png";
    static Color FOREGROUND_COLOR = Color.WHITE;    
    static Color BACKGROUND_COLOR = Color.BLUE; 
    static int BORDER = 10;
    
    static Map/*<String,Color>*/ COLOR_MAP = new HashMap/*<String,Color>*/();
    static Set/*<String>*/ FILL_TAGS = new HashSet/*<String>*/();
    
    static {
        // table things are yellow
        COLOR_MAP.put("TABLE", Color.YELLOW);
        COLOR_MAP.put("TBODY", Color.YELLOW);
        COLOR_MAP.put("TR", Color.YELLOW);
        COLOR_MAP.put("TD", Color.YELLOW);
        
        // hyperlinks are blue
        COLOR_MAP.put("A", Color.BLUE);
        
        // form inputs are orange
        COLOR_MAP.put("INPUT", Color.ORANGE);
        COLOR_MAP.put("TEXTAREA", Color.ORANGE);
        COLOR_MAP.put("SELECT", Color.ORANGE);
        COLOR_MAP.put("BUTTON", Color.ORANGE);
        
        // images are green
        COLOR_MAP.put("IMG", Color.GREEN.darker());
        
        FILL_TAGS.add("INPUT");
        FILL_TAGS.add("TEXTAREA");
        FILL_TAGS.add("SELECT");
        FILL_TAGS.add("BUTTON");
        
        //FILL_TAGS.add("IMG");
    }
    
    private class Box {
        int x,y,w,h,t; // (x,y) width, height, nodeType
        String tagName, text;
        public String toString() {
            return x + " " + y + " " + w + " " + h;
        }
    }
    
    private List/*<Box>*/ boxes = new LinkedList/*<Box>*/();
    
    private int width = 0, height = 0;
    
    public ShowBoxes(InputSource src) throws Exception{
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(src);
        Element root = doc.getDocumentElement();        
        NodeList list = root.getChildNodes();
        for (int i = 0; i < list.getLength(); i++) {
            Node child = list.item(i);
            if (child.getNodeType() == 3) continue;
            NamedNodeMap attrs = child.getAttributes();
            Box b = new Box();
            b.x = Integer.parseInt(attrs.getNamedItem("x").getNodeValue());
            b.y = Integer.parseInt(attrs.getNamedItem("y").getNodeValue());
            b.w = Integer.parseInt(attrs.getNamedItem("w").getNodeValue());
            b.h = Integer.parseInt(attrs.getNamedItem("h").getNodeValue());
            b.t = Integer.parseInt(attrs.getNamedItem("type").getNodeValue());
            if (b.t == Node.ELEMENT_NODE) {
                b.tagName = attrs.getNamedItem("tagName").getNodeValue();
            } else if (b.t == Node.TEXT_NODE) {
                b.text = attrs.getNamedItem("text").getNodeValue();
            }
            if ((b.x + b.w) > width) width = b.x + b.w;
            if ((b.y + b.h) > height) height = b.y + b.h;
            boxes.add(b);
        }
        width += BORDER;
        height += BORDER;
        setPreferredSize(new Dimension(width, height));        
    }
    
    public void paintComponent(Graphics g) {
        setBackground(Color.WHITE);
        g.fillRect(0, 0, width, height);
 //       g.translate(BORDER / 2, BORDER / 2);
        for (Iterator iter = boxes.iterator(); iter.hasNext(); ) {
            Box b = (Box)iter.next();
            if (b.tagName != null) {
                Color c = (Color)COLOR_MAP.get(b.tagName);
                if (c != null) g.setColor(c);
                else if (b.tagName.equals("BODY")) continue;
                else g.setColor(Color.BLACK);
            } else if (b.t == Node.TEXT_NODE) {
                g.setColor(Color.RED);
                g.drawString(b.text, b.x, b.y + 12);                
                continue;
            } else {
                g.setColor(Color.BLACK);
            }
            
            if (FILL_TAGS.contains(b.tagName)) {
                g.fillRect(b.x, b.y, b.w, b.h);
            } else {
                g.drawRect(b.x, b.y, b.w, b.h);
            }
        }
 //       g.translate(- BORDER / 2, - BORDER / 2);
    }
    
    public static boolean drawPicture(String xml, String destFilePath) {
        try {
            InputSource src = new InputSource(new StringReader(xml));
            ShowBoxes sb = new ShowBoxes(src);
            File file = new File(destFilePath);
            BufferedImage image = new BufferedImage(sb.width, sb.height, BufferedImage.TYPE_INT_RGB);
            Graphics g = image.getGraphics();
            sb.paintComponent(g);
            ImageIO.write(image, PNG_FORMAT, file);            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }
    
    public static void main(String[] args) throws Exception {
//        String name = "screenname";        
//        ShowBoxes sb = new ShowBoxes(new File("thumbprints/" + name + ".xml"));
//        File file = new File("thumbprints/" + name + ".png");        
//        BufferedImage image = new BufferedImage(sb.width, sb.height, BufferedImage.TYPE_INT_RGB);
//        Graphics g = image.getGraphics();
//        sb.paintComponent(g);
//        ImageIO.write(image, PNG_FORMAT, file);        
//        System.out.println("done writing " + name);
        
//        JFrame frame = new JFrame();
//        frame.add(new JScrollPane(sb));
//        frame.pack();
//        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
//        frame.setVisible(true);

    }
}
