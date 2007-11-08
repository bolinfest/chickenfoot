
package chickenfoot.experimental;

import javax.swing.*;
import javax.swing.UIManager;
import javax.swing.UIManager.LookAndFeelInfo;

import netscape.javascript.JSObject;
/**
 * <code>AccessJSObj</code> is ...
 *
 * @author mbolin
 */
public class AccessJSObj {

    public static void main(String[] argv) throws Exception {
        LookAndFeelInfo[] infos = UIManager.getInstalledLookAndFeels();
        for (int i = 0; i < infos.length; i++) {
            LookAndFeelInfo info = infos[i];
            System.out.println(info.getClassName());            
            UIManager.setLookAndFeel(info.getClassName());
            // JOptionPane.showMessageDialog(null, info.getClassName());
            JFileChooser fileChooser = new JFileChooser();
            fileChooser.show();
        }
        System.out.println("DONE");
    }
    
    public static void print(JSObject node) {
        node.setMember("a", "b");
        System.out.println(node); // invoking node.toString() throws an exception
        
        
    }
    
    public static java.awt.Point getPoint() {
        return new java.awt.Point(2, 3);
    }
 
    
    
}
